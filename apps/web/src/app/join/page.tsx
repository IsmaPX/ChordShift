/**
 * Página /join — el invitado escanea el QR y aterriza aquí.
 *
 * Flujo:
 * 1. Lee `?qr=<token>` de la URL
 * 2. Llama a POST /api/qr/redeem con el token
 * 3. Recibe un guest JWT (5 min) + el sessionId
 * 4. Sobrescribe el tokenStore con el guest token
 * 5. Redirige a /live/session/:sessionId?as=guest
 *
 * Si el canje falla, muestra un error claro.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, QrCode as QrIcon, AlertCircle, Music } from 'lucide-react'
import { useRedeemQr } from '@/hooks/useQrToken'
import { tokenStore } from '@/lib/api/tokenStore'
import { getSocketClient } from '@/lib/socket/socketClient'
import { apiClient } from '@/lib/api/client'

export function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const token = searchParams.get('qr')
  const redeem = useRedeemQr()
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No se proporcionó un token QR en la URL')
      return
    }
    redeem.mutate(token, {
      onSuccess: async response => {
        // Sobrescribir el token con el guest token
        tokenStore.setToken(response.guestToken)
        // Re-crear el socket con el nuevo token
        getSocketClient().disconnect()
        getSocketClient().connect()
        // Invalidar queries por si el user cambia
        queryClient.invalidateQueries()
        // Forzar el modo "api" para que el repositorio use la red
        localStorage.setItem('worship_piano_backend_mode', 'api')
        // Refrescar la base URL por si no estaba
        if (apiClient && typeof apiClient === 'object') {
          // No-op: apiClient lee env.VITE_API_URL en cada request
        }
        setStatus('success')
        // Redirigir a la sesión
        setTimeout(() => {
          navigate(`/live/session/${response.sessionId}?as=guest`)
        }, 800)
      },
      onError: (err: unknown) => {
        setStatus('error')
        setErrorMsg(err instanceof Error ? err.message : 'Error al canjear el QR')
      },
    })
  }, [token])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="card p-8 max-w-md w-full text-center">
        <QrIcon className="w-12 h-12 text-accent mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Unirse a sesión en vivo</h1>

        {status === 'pending' && (
          <div className="flex flex-col items-center gap-3 text-text-secondary">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Conectando a la sesión...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-3 text-accent">
            <Music className="w-8 h-8" />
            <p>¡Conectado! Redirigiendo a la sesión...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-3 text-danger">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{errorMsg}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 rounded-lg border border-border hover:border-accent text-sm"
            >
              Volver al login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
