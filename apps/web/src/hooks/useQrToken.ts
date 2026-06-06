/**
 * Hook para gestionar tokens QR de una live session.
 *
 * Flujo:
 * 1. El host llama `generateQr()` y obtiene un token + URL
 * 2. Muestra el QR en la UI
 * 3. El participante escanea → va a /join?qr=<token>
 * 4. El canje se hace en backend con `redeemQr()` (en la página /join)
 */

import { useQuery, useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

export type QrSession = {
  token: string
  url: string
  expiresAtMs: number
}

export type RedeemResponse = {
  guestToken: string
  sessionId: string
  expiresInSeconds: number
}

export function useGenerateQr(sessionId: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error('sessionId requerido')
      return apiClient.post<QrSession>(`/api/live-sessions/${sessionId}/qr`)
    },
  })
}

export function useRedeemQr() {
  return useMutation({
    mutationFn: async (token: string) => {
      return apiClient.post<RedeemResponse>('/api/qr/redeem', { token })
    },
  })
}
