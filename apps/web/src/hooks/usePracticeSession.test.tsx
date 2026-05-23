import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePracticeSession, usePracticeSessions, useUserStats } from './usePracticeSession'
import { createTestQueryClient } from '@/test/utils'
import { db, DEFAULT_SETTINGS } from '@/lib/db'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

async function seedUser() {
  const id = crypto.randomUUID()
  await db.users.add({ id, display_name: 'Test', pin_hash: null, settings: DEFAULT_SETTINGS, created_at: new Date().toISOString(), last_active: null })
  localStorage.setItem('worship_piano_active_profile', id)
  return id
}

describe('usePracticeSession', () => {
  it('inserts a practice session', async () => {
    const userId = await seedUser()
    await db.songs.add({ id: 's1', title: 'Song', artist: 'A', style_id: 'st1', difficulty: 1, key_signature: 'C', bpm: 120, instrument: 'piano', chord_data: { sections: [] }, is_published: true, created_at: new Date().toISOString() })

    const { result } = renderHook(() => usePracticeSession(), { wrapper })
    await act(async () => {})
    await act(async () => {})
    await act(async () => {
      result.current.mutate({ song_id: 's1', duration_s: 120, completed: true })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    const sessions = await db.practice_sessions.toArray()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].song_id).toBe('s1')
    expect(sessions[0].user_id).toBe(userId)
  })
})

describe('usePracticeSessions', () => {
  it('returns sessions for user', async () => {
    const userId = await seedUser()
    await db.practice_sessions.add({ id: 'ps-1', user_id: userId, song_id: 's1', started_at: new Date().toISOString(), duration_s: 60, completed: true })

    const { result } = renderHook(() => usePracticeSessions(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toHaveLength(1)
  })
})

describe('useUserStats', () => {
  it('returns computed stats', async () => {
    const userId = await seedUser()
    await db.practice_sessions.bulkAdd([
      { id: 'ps-1', user_id: userId, song_id: 's1', started_at: new Date().toISOString(), duration_s: 60, completed: true },
      { id: 'ps-2', user_id: userId, song_id: 's1', started_at: new Date().toISOString(), duration_s: 120, completed: false },
    ])
    await db.users.update(userId, { settings: { ...DEFAULT_SETTINGS, xp: 50 } })

    const { result } = renderHook(() => useUserStats(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toEqual({
      totalPracticeTime: 180,
      completedSessions: 1,
      totalSessions: 2,
      xp: 50,
    })
  })
})
