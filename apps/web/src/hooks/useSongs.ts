import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Song } from '@/types/music'

interface FetchSongsOptions {
  styleId?: string
  limit?: number
}

export function useSongs(options: FetchSongsOptions = {}) {
  return useQuery({
    queryKey: ['songs', options],
    queryFn: async () => {
      let query = supabase
        .from('songs')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (options.styleId) {
        query = query.eq('style_id', options.styleId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Song[]
    },
  })
}

export function useSong(songId: string) {
  return useQuery({
    queryKey: ['song', songId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('id', songId)
        .eq('is_published', true)
        .single()
      
      if (error) throw error
      return data as Song
    },
    enabled: !!songId,
  })
}

export function useCreateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (song: Omit<Song, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('songs')
        .insert(song)
        .select()
        .single()
      
      if (error) throw error
      return data as Song
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    },
  })
}