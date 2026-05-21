import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useEarTrainingResult, useEarTrainingStats } from './useEarTrainingResult'
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

describe('useEarTrainingResult', () => {
  it('inserts a result successfully', async () => {
    await seedUser()

    const { result } = renderHook(() => useEarTrainingResult(), { wrapper })
    await act(async () => {})
    await act(async () => {})
    await act(async () => {
      result.current.mutate({
        exercise_type: 'interval',
        question: { notes: ['C4', 'E4'], root: 'C4' },
        answer_given: 'major_3rd',
        correct_answer: 'major_3rd',
        is_correct: true,
        response_ms: 1500,
      })
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })

    const all = await db.ear_training_results.toArray()
    expect(all).toHaveLength(1)
    expect(all[0].is_correct).toBe(true)
  })
})

describe('useEarTrainingStats', () => {
  it('computes stats from results', async () => {
    const userId = await seedUser()
    await db.ear_training_results.bulkAdd([
      { id: 'r1', user_id: userId, exercise_type: 'interval', question: { notes: ['C4', 'E4'], root: 'C4' }, answer_given: 'major_3rd', correct_answer: 'major_3rd', is_correct: true, response_ms: 1000, created_at: new Date().toISOString() },
      { id: 'r2', user_id: userId, exercise_type: 'interval', question: { notes: ['C4', 'E4'], root: 'C4' }, answer_given: 'major_3rd', correct_answer: 'major_3rd', is_correct: true, response_ms: 2000, created_at: new Date().toISOString() },
      { id: 'r3', user_id: userId, exercise_type: 'interval', question: { notes: ['C4', 'Eb4'], root: 'C4' }, answer_given: 'major_3rd', correct_answer: 'minor_3rd', is_correct: false, response_ms: 1500, created_at: new Date().toISOString() },
    ])

    const { result } = renderHook(() => useEarTrainingStats(), { wrapper })
    await act(async () => {})
    await act(async () => {})
    act(() => { result.current.mutate() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true), { timeout: 5000 })
    expect(result.current.data).toMatchObject({
      total: 3,
      correct: 2,
      avgResponseMs: 1500,
    })
    expect(result.current.data!.accuracy).toBeCloseTo(66.67, 1)
  })
})
