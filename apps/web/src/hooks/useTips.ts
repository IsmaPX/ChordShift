import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tip } from '@/types/music'

interface UseTipsOptions {
  category?: string
  styleId?: string
  limit?: number
}

export function useTips(options: UseTipsOptions = {}) {
  return useQuery({
    queryKey: ['tips', options],
    queryFn: async () => {
      let query = supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false })

      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.styleId) {
        query = query.eq('style_id', options.styleId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Tip[]
    },
  })
}

export function useRandomTip(difficultyMin: number = 1) {
  return useQuery({
    queryKey: ['tip', 'random', difficultyMin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .gte('difficulty_min', difficultyMin)
        .limit(50)

      if (error) throw error
      
      const randomIndex = Math.floor(Math.random() * (data?.length || 0))
      return data?.[randomIndex] as Tip | null
    },
  })
}