import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db'
import { useAuth } from './useAuth'
import type { PracticeSession } from '@/types/music'

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

      const newSession: PracticeSession = {
        id: crypto.randomUUID(),
        user_id: user.id,
        song_id: session.song_id,
        started_at: new Date().toISOString(),
        duration_s: session.duration_s || 0,
        completed: session.completed || false,
      }

      await db.practice_sessions.add(newSession)
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

      const sessions = await db.practice_sessions
        .where('user_id')
        .equals(user.id)
        .toArray()

      const enriched = await Promise.all(
        sessions.map(async (s) => {
          const song = await db.songs.get(s.song_id)
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

      const sessions = await db.practice_sessions
        .where('user_id')
        .equals(user.id)
        .toArray()

      const profile = await db.users.get(user.id)

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
