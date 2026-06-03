import { useMutation, useQueryClient } from '@tanstack/react-query'
import { earTrainingRepository } from '@/lib/repositories/EarTrainingRepository'
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

  return useMutation({
    mutationFn: async (result: EarTrainingResultInput) => {
      const activeId = localStorage.getItem('worship_piano_active_profile')
      if (!activeId) throw new Error('Not authenticated')

      const entry: EarTrainingResult = {
        id: crypto.randomUUID(),
        user_id: activeId,
        ...result,
        created_at: new Date().toISOString(),
      }

      await earTrainingRepository.create(entry)
      return entry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ear-training-results'] })
    },
  })
}

export function useEarTrainingStats() {
  return useMutation({
    mutationFn: async () => {
      const activeId = localStorage.getItem('worship_piano_active_profile')
      if (!activeId) throw new Error('Not authenticated')

      const data = await earTrainingRepository.getByUserId(activeId)

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
