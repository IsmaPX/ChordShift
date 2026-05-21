import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useUserSettings } from './useUserSettings'
import { createTestQueryClient } from '@/test/utils'

const { mockData, mockGetSession, mockOnAuth } = vi.hoisted(() => ({
  mockData: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuth: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => {
        const thenable = Promise.resolve(mockData()) as Promise<unknown> & Record<string, ReturnType<typeof vi.fn>>
        thenable.eq = vi.fn(() => thenable)
        thenable.single = vi.fn(() => thenable)
        return thenable
      }),
      update: vi.fn(() => {
        const thenable = Promise.resolve(mockData()) as Promise<unknown> & Record<string, ReturnType<typeof vi.fn>>
        thenable.eq = vi.fn(() => thenable)
        return thenable
      }),
    })),
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
})

const fakeSettings = {
  tempo_bpm: 120,
  language: 'es',
  notifications_enabled: true,
  feedback_concept: 'pulse' as const,
  xp: 100,
}

describe('useUserSettings', () => {
  it('returns settings for authenticated user', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'a@b.com', user_metadata: {} } } },
      error: null,
    })
    mockOnAuth.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    mockData.mockResolvedValue({ data: { settings: fakeSettings }, error: null })

    const { result } = renderHook(() => useUserSettings(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(fakeSettings)
  })

  it('is not enabled when no user', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuth.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })

    const { result } = renderHook(() => useUserSettings(), { wrapper })
    expect(result.current.isFetching).toBe(false)
  })
})
