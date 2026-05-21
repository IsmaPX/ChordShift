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
