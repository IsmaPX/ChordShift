import { useQuery } from '@tanstack/react-query'
import { tipRepository } from '@/lib/repositories/TipRepository'
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
      let results = await tipRepository.getAll()

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
      const data = await tipRepository.getAll()
      const filtered = data.filter(t => t.difficulty_min <= difficultyMin)

      if (filtered.length === 0) return null
      const randomIndex = Math.floor(Math.random() * filtered.length)
      return filtered[randomIndex] as Tip
    },
  })
}
