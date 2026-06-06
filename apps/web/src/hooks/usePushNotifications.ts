/**
 * Hook para gestionar Web Push subscriptions.
 *
 * Flujo:
 * 1. Pedir permiso al usuario (notifications.requestPermission)
 * 2. Si lo concede, registrar un service worker
 * 3. Crear subscription (pushManager.subscribe) con la VAPID key
 * 4. Enviar la subscription al backend (POST /api/push/subscribe)
 * 5. Al hacer logout, llamar a unsubscribe() y POST /api/push/unsubscribe
 *
 * Si el browser no soporta Web Push, el hook degrada gracefully
 * (enabled: false) sin romper la app.
 */

import { useEffect, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'

const SW_URL = '/sw-push.js'

export type PushState = {
  /** Si el browser soporta Web Push. */
  supported: boolean
  /** Si el usuario concedió permiso. */
  permission: NotificationPermission | 'unsupported'
  /** Si hay una subscription activa registrada en el backend. */
  subscribed: boolean
  /** Si está en proceso de subscribe/unsubscribe. */
  busy: boolean
  /** Error de la última operación. */
  error: string | null
}

type VapidResponse = {
  publicKey: string | null
  enabled: boolean
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    supported: false,
    permission: 'unsupported',
    subscribed: false,
    busy: false,
    error: null,
  })

  // Inicializar estado al montar
  useEffect(() => {
    if (typeof window === 'undefined') return
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    if (!supported) {
      setState(s => ({ ...s, supported: false, permission: 'unsupported' }))
      return
    }
    setState(s => ({
      ...s,
      supported: true,
      permission: Notification.permission,
    }))
  }, [])

  /**
   * Pide permiso y registra la subscription.
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.supported) {
      setState(s => ({ ...s, error: 'Web Push no soportado en este browser' }))
      return false
    }

    setState(s => ({ ...s, busy: true, error: null }))

    try {
      // 1) Permiso
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(s => ({ ...s, permission, busy: false, error: 'Permiso denegado' }))
        return false
      }

      // 2) VAPID key
      const { publicKey } = await apiClient.get<VapidResponse>('/api/push/vapid-key')
      if (!publicKey) {
        setState(s => ({
          ...s,
          busy: false,
          error: 'VAPID no configurado en el servidor',
        }))
        return false
      }

      // 3) Service worker
      const registration = await navigator.serviceWorker.register(SW_URL)

      // 4) Subscribe al PushManager
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        })
      }

      // 5) Enviar al backend
      const subJson = subscription.toJSON()
      await apiClient.post('/api/push/subscribe', {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      })

      setState(s => ({
        ...s,
        permission: 'granted',
        subscribed: true,
        busy: false,
        error: null,
      }))
      return true
    } catch (err) {
      setState(s => ({
        ...s,
        busy: false,
        error: err instanceof Error ? err.message : 'Error al suscribirse',
      }))
      return false
    }
  }, [state.supported])

  /**
   * Elimina la subscription local y del backend.
   */
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!state.supported) return false
    setState(s => ({ ...s, busy: true, error: null }))

    try {
      const registration = await navigator.serviceWorker.getRegistration(SW_URL)
      const subscription = await registration?.pushManager.getSubscription()
      if (subscription) {
        const endpoint = subscription.endpoint
        await subscription.unsubscribe()
        await apiClient.post('/api/push/unsubscribe', { endpoint })
      }
      setState(s => ({ ...s, subscribed: false, busy: false }))
      return true
    } catch (err) {
      setState(s => ({
        ...s,
        busy: false,
        error: err instanceof Error ? err.message : 'Error al desuscribirse',
      }))
      return false
    }
  }, [state.supported])

  /**
   * Envía una push de prueba al usuario actual.
   */
  const sendTest = useCallback(async () => {
    try {
      const result = await apiClient.post<{ sent: number; failed: number; skipped: boolean }>(
        '/api/push/test',
      )
      if (result.skipped) {
        setState(s => ({ ...s, error: 'VAPID no configurado en el servidor' }))
      } else if (result.sent === 0) {
        setState(s => ({ ...s, error: 'No hay suscripciones activas' }))
      }
    } catch (err) {
      setState(s => ({
        ...s,
        error: err instanceof Error ? err.message : 'Error al enviar push',
      }))
    }
  }, [])

  return { state, subscribe, unsubscribe, sendTest }
}
