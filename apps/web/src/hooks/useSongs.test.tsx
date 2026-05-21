import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSongs, useSong } from './useSongs'
import { createTestQueryClient } from '@/test/utils'

function createThenable<T>(resolveValue: T) {
  const thenable = Promise.resolve(resolveValue) as Promise<T> & Record<string, ReturnType<typeof vi.fn>>
  thenable.eq = vi.fn(() => thenable)
  thenable.order = vi.fn(() => thenable)
  thenable.limit = vi.fn(() => thenable)
  thenable.single = vi.fn(() => thenable)
  return thenable
}

const { mockData } = vi.hoisted(() => ({
  mockData: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => createThenable(mockData())),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  })),
}))

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const fakeSongs = [
  { id: '1', title: 'Canción 1', artist: 'Artista A', style_id: 'style-1', difficulty: 2, key_signature: 'C', bpm: 120, is_published: true },
  { id: '2', title: 'Canción 2', artist: 'Artista B', style_id: 'style-1', difficulty: 3, key_signature: 'G', bpm: 80, is_published: true },
]

beforeEach(() => {
  mockData.mockReset()
})

describe('useSongs', () => {
  it('returns songs when query succeeds', async () => {
    mockData.mockReturnValue({ data: fakeSongs, error: null })

    const { result } = renderHook(() => useSongs(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(fakeSongs)
  })

  it('returns empty array when no songs', async () => {
    mockData.mockReturnValue({ data: [], error: null })

    const { result } = renderHook(() => useSongs(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })

  it('returns error when query fails', async () => {
    mockData.mockReturnValue({ data: null, error: new Error('DB error') })

    const { result } = renderHook(() => useSongs(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useSong', () => {
  it('returns a single song when query succeeds', async () => {
    mockData.mockReturnValue({ data: fakeSongs[0], error: null })

    const { result } = renderHook(() => useSong('1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(fakeSongs[0])
  })
})
