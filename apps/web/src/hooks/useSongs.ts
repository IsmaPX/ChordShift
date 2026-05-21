import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db'
import type { Song } from '@/types/music'

interface FetchSongsOptions {
  styleId?: string
  limit?: number
  search?: string
  tab?: 'all' | 'preset' | 'mine'
}

export function useSongs(options: FetchSongsOptions = {}) {
  const { styleId, search, tab } = options
  return useQuery({
    queryKey: ['songs', tab || 'all', styleId || '', search || ''],
    queryFn: async () => {
      const published = options.tab === 'mine' ? false : true
      let results = (await db.songs.toArray()).filter(s => s.is_published === published)

      if (options.styleId) {
        results = results.filter(s => s.style_id === options.styleId)
      }

      if (options.search) {
        const q = options.search.toLowerCase()
        results = results.filter(s => s.title.toLowerCase().includes(q) || (s.artist?.toLowerCase() || '').includes(q))
      }

      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      if (options.limit) {
        results = results.slice(0, options.limit)
      }

      return results
    },
  })
}

export function useSong(songId: string) {
  return useQuery({
    queryKey: ['song', songId],
    queryFn: async () => {
      const data = await db.songs.get(songId)
      if (!data) throw new Error('Song not found')
      return data as Song
    },
    enabled: !!songId,
  })
}

export function useCreateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (song: Omit<Song, 'id'> & { id?: string }) => {
      const newSong = { ...song, id: song.id || crypto.randomUUID() } as Song
      await db.songs.add(newSong)
      return newSong
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    },
  })
}
