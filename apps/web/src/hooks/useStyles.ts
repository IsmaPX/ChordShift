import { useQuery } from '@tanstack/react-query'
import { styleRepository } from '@/lib/repositories/StyleRepository'
import type { Style } from '@/types/music'

export function useStyles() {
  return useQuery({
    queryKey: ['styles'],
    queryFn: async () => {
      const data = await styleRepository.getAll()
      return data as Style[]
    },
  })
}

export function useStyle(styleId: string) {
  return useQuery({
    queryKey: ['style', styleId],
    queryFn: async () => {
      const data = await styleRepository.getById(styleId)
      if (!data) throw new Error('Style not found')
      return data as Style
    },
    enabled: !!styleId,
  })
}
