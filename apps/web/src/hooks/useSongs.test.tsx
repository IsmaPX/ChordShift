import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useSongs, useSong, useCreateSong } from './useSongs'
import { createTestQueryClient } from '@/test/utils'
import { db } from '@/lib/db'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

const fakeSongs = [
  { id: '1', title: 'Canción 1', artist: 'Artista A', style_id: 'style-1', difficulty: 2, key_signature: 'C', bpm: 120, chord_data: { sections: [] }, is_published: true, created_at: '2024-01-01' },
  { id: '2', title: 'Canción 2', artist: 'Artista B', style_id: 'style-1', difficulty: 3, key_signature: 'G', bpm: 80, chord_data: { sections: [] }, is_published: true, created_at: '2024-01-02' },
]

describe('useSongs', () => {
  it('returns published songs', async () => {
    const { result } = renderHook(() => useSongs(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(1)
    expect(result.current.data!.some(s => s.title === 'Test')).toBe(true)
  })

  it('returns songs when data exists', async () => {
    await db.songs.bulkAdd(fakeSongs)

    const { result } = renderHook(() => useSongs(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(3)
    expect(result.current.data![0].title).toBe('Canción 2')
  })

  it('filters by search', async () => {
    await db.songs.bulkAdd(fakeSongs)

    const { result } = renderHook(() => useSongs({ search: 'Canción 1' }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].title).toBe('Canción 1')
  })
})

describe('useSong', () => {
  it('returns a single song', async () => {
    await db.songs.bulkAdd(fakeSongs)

    const { result } = renderHook(() => useSong('1'), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
      expect(result.current.data?.title).toBe('Canción 1')
    })
  })

  it('throws when song not found', async () => {
    const { result } = renderHook(() => useSong('nonexistent'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useCreateSong', () => {
  it('creates a song', async () => {
    const { result } = renderHook(() => useCreateSong(), { wrapper })

    await waitFor(() => {
      result.current.mutate({ title: 'New Song', artist: 'Me', style_id: 's1', difficulty: 1, key_signature: 'C', bpm: 120, chord_data: { sections: [] }, is_published: false, created_at: new Date().toISOString() })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.title).toBe('New Song')

    const all = await db.songs.toArray()
    expect(all).toHaveLength(2)
  })
})
