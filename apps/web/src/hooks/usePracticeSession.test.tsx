import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { usePracticeSession, usePracticeSessions, useUserStats } from './usePracticeSession'
import { createTestQueryClient } from '@/test/utils'

const { mockData, mockGetSession, mockOnAuth } = vi.hoisted(() => ({
  mockData: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuth: vi.fn(),
}))

function createThenable() {
  const p = Promise.resolve().then(() => mockData())
  const t = p as Promise<unknown> & Record<string, ReturnType<typeof vi.fn>>
  t.eq = vi.fn(() => t)
  t.order = vi.fn(() => t)
  t.limit = vi.fn(() => t)
  t.select = vi.fn(() => t)
  t.single = vi.fn(() => t)
  t.insert = vi.fn(() => t)
  return t
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => createThenable()),
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuth,
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  })),
}))

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

beforeEach(() => {
  mockData.mockReset()
  mockGetSession.mockReset()
  mockOnAuth.mockReset()
  mockGetSession.mockResolvedValue({
    data: { session: { user: { id: 'u1', email: 'a@b.com', user_metadata: {} } } },
    error: null,
  })
  mockOnAuth.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
})

describe('usePracticeSession (mutation)', () => {
  it('mutates successfully', async () => {
    const inserted = { id: 'ps-1', user_id: 'u1', song_id: 's1', duration_s: 120, completed: true }
    mockData.mockResolvedValue({ data: inserted, error: null })

    const { result } = renderHook(() => usePracticeSession(), { wrapper })
    // flush microtasks so useAuth resolves the user
    await act(async () => {})
    act(() => { result.current.mutate({ song_id: 's1', duration_s: 120, completed: true }) })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('throws when not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockData.mockResolvedValue({ data: null, error: null })

    const { result } = renderHook(() => usePracticeSession(), { wrapper })
    // flush microtasks so useAuth resolves (no user)
    await act(async () => {})
    act(() => { result.current.mutate({ song_id: 's1' }) })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('usePracticeSessions', () => {
  it('returns sessions for authenticated user', async () => {
    const sessions = [{ id: 'ps-1', user_id: 'u1', song_id: 's1', duration_s: 120, completed: true }]
    mockData.mockResolvedValue({ data: sessions, error: null })

    const { result } = renderHook(() => usePracticeSessions(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(sessions)
  })
})

describe('useUserStats', () => {
  it('returns computed stats', async () => {
    mockData
      .mockResolvedValueOnce({ data: [{ duration_s: 60, completed: true }, { duration_s: 120, completed: false }], error: null })
      .mockResolvedValueOnce({ data: { settings: { xp: 50 } }, error: null })

    const { result } = renderHook(() => useUserStats(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({
      totalPracticeTime: 180,
      completedSessions: 1,
      totalSessions: 2,
      xp: 50,
    })
  })
})
