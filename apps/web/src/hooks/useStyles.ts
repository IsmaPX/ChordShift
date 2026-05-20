import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Style } from '@/types/music'

export function useStyles() {
  return useQuery({
    queryKey: ['styles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('styles')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      return data as Style[]
    },
  })
}

export function useStyle(styleId: string) {
  return useQuery({
    queryKey: ['style', styleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('styles')
        .select('*')
        .eq('id', styleId)
        .single()
      
      if (error) throw error
      return data as Style
    },
    enabled: !!styleId,
  })
}