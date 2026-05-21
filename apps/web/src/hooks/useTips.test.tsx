import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTips } from './useTips'
import { createTestQueryClient } from '@/test/utils'

const { mockData } = vi.hoisted(() => ({ mockData: vi.fn() }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => {
        const thenable = Promise.resolve(mockData()) as Promise<unknown> & Record<string, ReturnType<typeof vi.fn>>
        thenable.eq = vi.fn(() => thenable)
        thenable.order = vi.fn(() => thenable)
        thenable.limit = vi.fn(() => thenable)
        thenable.gte = vi.fn(() => thenable)
        return thenable
      }),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}))

const fakeTips = [
  { id: 't1', content: 'Tip 1', category: 'teoría', style_id: null, difficulty_min: 1 },
  { id: 't2', content: 'Tip 2', category: 'técnica', style_id: 's1', difficulty_min: 2 },
]

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

beforeEach(() => { mockData.mockReset() })

describe('useTips', () => {
  it('returns tips on success', async () => {
    mockData.mockReturnValue({ data: fakeTips, error: null })
    const { result } = renderHook(() => useTips(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(fakeTips)
  })

  it('filters by category', async () => {
    mockData.mockReturnValue({ data: [fakeTips[0]], error: null })
    const { result } = renderHook(() => useTips({ category: 'teoría' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
  })

  it('handles error', async () => {
    mockData.mockReturnValue({ data: null, error: new Error('fail') })
    const { result } = renderHook(() => useTips(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
