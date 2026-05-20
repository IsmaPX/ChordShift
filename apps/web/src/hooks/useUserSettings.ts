import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface UserSettings {
  tempo_bpm: number
  language: string
  notifications_enabled: boolean
  feedback_concept: 'pulse' | 'bar' | 'rings'
  xp: number
}

export function useUserSettings() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-settings'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data?.settings as UserSettings
    },
    enabled: !!user,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!user) throw new Error('Not authenticated')

      // Get current settings
      const { data: current } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.id)
        .single()

      const newSettings = {
        ...current?.settings,
        ...updates,
      }

      const { error } = await supabase
        .from('users')
        .update({ settings: newSettings })
        .eq('id', user.id)

      if (error) throw error
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

      const { data: current } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.id)
        .single()

      const currentXP = current?.settings?.xp || 0
      const newXP = currentXP + amount

      const { error } = await supabase
        .from('users')
        .update({ 
          settings: {
            ...current?.settings,
            xp: newXP,
          }
        })
        .eq('id', user.id)

      if (error) throw error
      return newXP
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}