import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuth } from './useAuth'
import { createTestQueryClient } from '@/test/utils'
import { db } from '@/lib/db'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

describe('useAuth', () => {
  it('returns unauthenticated state when no active profile', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(result.current.profiles).toEqual([])
  })

  it('creates a profile and logs in', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createProfile('Test User')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.display_name).toBe('Test User')
    expect(result.current.profiles).toHaveLength(1)
  })

  it('returns authenticated state when active profile exists', async () => {
    const id = crypto.randomUUID()
    await db.users.add({ id, display_name: 'Existing', pin_hash: null, settings: { tempo_bpm: 120, language: 'es', notifications_enabled: true, feedback_concept: 'rings', xp: 0 }, created_at: new Date().toISOString(), last_active: null })
    localStorage.setItem('worship_piano_active_profile', id)

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.display_name).toBe('Existing')
  })

  it('logs out and clears active profile', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createProfile('Logout Test')
    })
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
    expect(localStorage.getItem('worship_piano_active_profile')).toBeNull()
  })

  it('deletes a profile and its related data', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.createProfile('Delete Me')
    })
    const profileId = result.current.user!.id

    await db.practice_sessions.add({ id: crypto.randomUUID(), user_id: profileId, song_id: 's1', started_at: new Date().toISOString(), duration_s: 60, completed: true })

    await act(async () => {
      await result.current.deleteProfile(profileId)
    })

    expect(result.current.isAuthenticated).toBe(false)
    const sessions = await db.practice_sessions.where('user_id').equals(profileId).toArray()
    expect(sessions).toHaveLength(0)
  })
})
