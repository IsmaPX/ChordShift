import { useQuery } from '@tanstack/react-query'
import { db } from '@/lib/db'
import type { Style } from '@/types/music'

export function useStyles() {
  return useQuery({
    queryKey: ['styles'],
    queryFn: async () => {
      const data = await db.styles.orderBy('name').toArray()
      return data as Style[]
    },
  })
}

export function useStyle(styleId: string) {
  return useQuery({
    queryKey: ['style', styleId],
    queryFn: async () => {
      const data = await db.styles.get(styleId)
      if (!data) throw new Error('Style not found')
      return data as Style
    },
    enabled: !!styleId,
  })
}
