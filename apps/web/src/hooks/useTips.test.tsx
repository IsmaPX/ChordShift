import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useTips } from './useTips'
import { createTestQueryClient } from '@/test/utils'
import { db } from '@/lib/db'

function wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={createTestQueryClient()}>{children}</QueryClientProvider>
}

describe('useTips', () => {
  it('returns all tips', async () => {
    await db.tips.bulkAdd([
      { id: 't1', content: 'Tip 1', category: 'teoría', style_id: null, difficulty_min: 1 },
    ])

    const { result } = renderHook(() => useTips(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data!.length).toBeGreaterThanOrEqual(2)
    expect(result.current.data!.some(t => t.content === 'Tip 1')).toBe(true)
  })

  it('filters by category', async () => {
    await db.tips.bulkAdd([
      { id: 't1', content: 'Tip técnico', category: 'técnica', style_id: null, difficulty_min: 1 },
    ])

    const { result } = renderHook(() => useTips({ category: 'técnica' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data![0].content).toBe('Tip técnico')
  })

  it('returns empty when no matching category', async () => {
    const { result } = renderHook(() => useTips({ category: 'mentalidad' }), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})
