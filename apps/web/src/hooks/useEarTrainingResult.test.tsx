import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useEarTrainingResult, useEarTrainingStats } from './useEarTrainingResult'
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

describe('useEarTrainingResult', () => {
  it('inserts a result successfully', async () => {
    const inserted = { id: 'r1', exercise_type: 'interval', is_correct: true }
    mockData.mockResolvedValue({ data: inserted, error: null })

    const { result } = renderHook(() => useEarTrainingResult(), { wrapper })
    // flush microtasks so useAuth resolves the user
    await act(async () => {})
    act(() => {
      result.current.mutate({
        exercise_type: 'interval',
        question: { notes: ['C4', 'E4'], root: 'C4' },
        answer_given: 'major_3rd',
        correct_answer: 'major_3rd',
        is_correct: true,
        response_ms: 1500,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useEarTrainingStats', () => {
  it('computes stats from results', async () => {
    const results = [
      { is_correct: true, response_ms: 1000 },
      { is_correct: true, response_ms: 2000 },
      { is_correct: false, response_ms: 1500 },
    ]
    mockData.mockResolvedValue({ data: results, error: null })

    const { result } = renderHook(() => useEarTrainingStats(), { wrapper })
    // flush microtasks so useAuth resolves the user
    await act(async () => {})
    act(() => { result.current.mutate() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({
      total: 3,
      correct: 2,
      avgResponseMs: 1500,
    })
    expect((result.current.data as { accuracy: number }).accuracy).toBeCloseTo(66.67, 1)
  })
})
