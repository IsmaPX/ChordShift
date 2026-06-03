import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { practiceSessionRepository } from '@/lib/repositories/SessionRepository'
import { songRepository } from '@/lib/repositories/SongRepository'
import { settingsRepository } from '@/lib/repositories/SettingsRepository'
import type { PracticeSession } from '@/types/music'

interface PracticeSessionInput {
  song_id: string
  duration_s?: number
  completed?: boolean
}

export function usePracticeSession() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (session: PracticeSessionInput) => {
      const activeId = localStorage.getItem('worship_piano_active_profile')
      if (!activeId) throw new Error('Not authenticated')

      const newSession: PracticeSession = {
        id: crypto.randomUUID(),
        user_id: activeId,
        song_id: session.song_id,
        started_at: new Date().toISOString(),
        duration_s: session.duration_s || 0,
        completed: session.completed || false,
      }

      await practiceSessionRepository.create(newSession)
      return newSession
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

      const sessions = await practiceSessionRepository.getByUserId(user.id)

      const enriched = await Promise.all(
        sessions.map(async (s) => {
          const song = await songRepository.getById(s.song_id)
          return {
            ...s,
            songs: song ? { id: song.id, title: song.title, artist: song.artist, key_signature: song.key_signature, bpm: song.bpm } : null,
          }
        })
      )

      enriched.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      return enriched.slice(0, 50)
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

      const sessions = await practiceSessionRepository.getByUserId(user.id)
      const profile = await settingsRepository.getByProfileId(user.id)

      const totalPracticeTime = sessions.reduce((sum, s) => sum + (s.duration_s || 0), 0)
      const completedSessions = sessions.filter(s => s.completed).length
      const xp = profile?.settings?.xp || 0

      return {
        totalPracticeTime,
        completedSessions,
        totalSessions: sessions.length,
        xp,
      }
    },
    enabled: !!user,
  })
}
