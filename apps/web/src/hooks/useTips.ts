import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/db'
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
      let results = await db.tips.toArray()

      if (options.category) {
        results = results.filter(t => t.category === options.category)
      }

      if (options.styleId) {
        results = results.filter(t => t.style_id === options.styleId)
      }

      if (options.limit) {
        results = results.slice(0, options.limit)
      }

      return results
    },
  })
}

export function useRandomTip(difficultyMin: number = 1) {
  return useQuery({
    queryKey: ['tip', 'random', difficultyMin],
    queryFn: async () => {
      const data = await db.tips
        .filter(t => t.difficulty_min <= difficultyMin)
        .toArray()

      if (data.length === 0) return null
      const randomIndex = Math.floor(Math.random() * data.length)
      return data[randomIndex] as Tip
    },
  })
}
