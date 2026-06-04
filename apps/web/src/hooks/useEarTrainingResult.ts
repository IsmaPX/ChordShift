import { useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db'
import { useAuth } from './useAuth'
import type { EarTrainingResult } from '@/lib/db'

interface EarTrainingResultInput {
  exercise_type: 'interval' | 'triad' | 'seventh_chord'
  question: { notes: string[]; root: string }
  answer_given: string
  correct_answer: string
  is_correct: boolean
  response_ms: number
}

export function useEarTrainingResult() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (result: EarTrainingResultInput) => {
      if (!user) throw new Error('Not authenticated')

      const entry: EarTrainingResult = {
        id: crypto.randomUUID(),
        user_id: user.id,
        ...result,
        created_at: new Date().toISOString(),
      }

      await db.ear_training_results.add(entry)
      return entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ear-training-results'] })
    },
  })
}

export function useEarTrainingStats() {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const data = await db.ear_training_results
        .where('user_id')
        .equals(user.id)
        .toArray()

      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      const recent = data.slice(0, 100)

      const total = recent.length
      const correct = recent.filter(r => r.is_correct).length
      const avgResponseMs = total > 0
        ? recent.reduce((sum, r) => sum + (r.response_ms || 0), 0) / total
        : 0

      return {
        total,
        correct,
        accuracy: total > 0 ? (correct / total) * 100 : 0,
        avgResponseMs: Math.round(avgResponseMs),
      }
    },
  })
}
