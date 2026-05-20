import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface PracticeSessionInput {
  song_id: string
  duration_s?: number
  completed?: boolean
}

export function usePracticeSession() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (session: PracticeSessionInput) => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('practice_sessions')
        .insert({
          ...session,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-sessions'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function usePracticeSessions() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['practice-sessions'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('practice_sessions')
        .select(`
          *,
          songs (id, title, artist, key_signature, bpm)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useUserStats() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated')

      // Get total practice time
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('duration_s, completed')
        .eq('user_id', user.id)

      // Get XP from settings
      const { data: userData } = await supabase
        .from('users')
        .select('settings')
        .eq('id', user.id)
        .single()

      const totalPracticeTime = sessions?.reduce((sum, s) => sum + (s.duration_s || 0), 0) || 0
      const completedSessions = sessions?.filter(s => s.completed).length || 0
      const xp = userData?.settings?.xp || 0

      return {
        totalPracticeTime,
        completedSessions,
        totalSessions: sessions?.length || 0,
        xp,
      }
    },
    enabled: !!user,
  })
}