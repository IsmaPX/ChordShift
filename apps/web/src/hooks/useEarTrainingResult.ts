import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface EarTrainingResultInput {
  exercise_type: 'interval' | 'triad' | 'seventh_chord'
  question: {
    notes: string[]
    root: string
  }
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

      const { data, error } = await supabase
        .from('ear_training_results')
        .insert({
          ...result,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
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

      const { data, error } = await supabase
        .from('ear_training_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      // Calculate stats
      const total = data.length
      const correct = data.filter(r => r.is_correct).length
      const avgResponseMs = total > 0 
        ? data.reduce((sum, r) => sum + (r.response_ms || 0), 0) / total 
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