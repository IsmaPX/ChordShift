import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { db, DEFAULT_SETTINGS } from '@/lib/db'
import { useAuth } from './useAuth'
import type { UserSettings } from '@/types/music'

export function useUserSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const profile = await db.users.get(user.id)
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
      const profile = await db.users.get(id)
      const newSettings = { ...profile?.settings, ...updates } as UserSettings
      await db.users.update(id, { settings: newSettings })
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
      const profile = await db.users.get(user.id)
      const currentXP = profile?.settings?.xp || 0
      const newXP = currentXP + amount
      const newSettings = { ...profile?.settings, xp: newXP } as UserSettings
      await db.users.update(user.id, { settings: newSettings })
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
      await db.practice_sessions.where('user_id').equals(user.id).delete()
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
      await db.ear_training_results.where('user_id').equals(user.id).delete()
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
      const pin_hash = pin ? await hashPin(pin) : null
      await db.users.update(user.id, { pin_hash })
      const newSettings = { ...user.settings, pin_enabled: !!pin } as UserSettings
      await db.users.update(user.id, { settings: newSettings })
      return pin_hash
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
    },
  })
}



async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + 'worship-piano-salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}
