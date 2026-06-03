import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { settingsRepository } from '@/lib/repositories/SettingsRepository'
import { practiceSessionRepository } from '@/lib/repositories/SessionRepository'
import { earTrainingRepository } from '@/lib/repositories/EarTrainingRepository'
import { hashPin } from '@/lib/crypto'
import type { UserSettings } from '@/types/music'
import { DEFAULT_SETTINGS } from '@/lib/db'

export function useUserSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const profile = await settingsRepository.getByProfileId(user.id)
      return profile?.settings ?? DEFAULT_SETTINGS
    },
    enabled: !!user,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const id = localStorage.getItem('worship_piano_active_profile')
      if (!id) throw new Error('Not authenticated')
      const profile = await settingsRepository.getByProfileId(id)
      const newSettings = { ...profile?.settings, ...updates } as UserSettings
      await settingsRepository.updateSettings(id, updates)
      return newSettings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
    },
  })
}

export function useAddXP() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!user) throw new Error('Not authenticated')
      const profile = await settingsRepository.getByProfileId(user.id)
      const currentXP = profile?.settings?.xp || 0
      const newXP = currentXP + amount
      await settingsRepository.addXP(user.id, amount)
      return newXP
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useClearPracticeHistory() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      await practiceSessionRepository.deleteByUserId(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useClearEarTrainingResults() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      await earTrainingRepository.deleteByUserId(user.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ear-training-stats'] })
    },
  })
}

export function useSetPin() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (pin: string | null) => {
      if (!user) throw new Error('Not authenticated')
      const pin_hash_val = pin ? await hashPin(pin) : null
      await settingsRepository.setPin(user.id, pin_hash_val)
      return pin_hash_val
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
    },
  })
}

export function useSendOTP() {
  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      if (window.isElectron && window.electronAPI) {
        return window.electronAPI.sendOTP(phone, code)
      }
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send OTP')
      }
      return res.json()
    },
  })
}

export function useSendWhatsApp() {
  return useMutation({
    mutationFn: async ({ phone, message }: { phone: string; message: string }) => {
      if (window.isElectron && window.electronAPI) {
        return window.electronAPI.sendWhatsApp(phone, message)
      }
      const res = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send WhatsApp')
      }
      return res.json()
    },
  })
}
