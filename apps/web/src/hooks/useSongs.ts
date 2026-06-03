import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { songRepository } from '@/lib/repositories/SongRepository'
import type { Song } from '@/types/music'

interface FetchSongsOptions {
  styleId?: string
  search?: string
  tab?: 'all' | 'preset' | 'mine'
}

export function useSongs(options: FetchSongsOptions = {}) {
  const { styleId, search, tab } = options
  return useQuery({
    queryKey: ['songs', tab || 'all', styleId || '', search || ''],
    queryFn: async () => {
      let results = await songRepository.getAll()
      const published = tab === 'mine' ? false : true
      results = results.filter(s => s.is_published === published)

      if (styleId) {
        results = results.filter(s => s.style_id === styleId)
      }

      if (search) {
        const q = search.toLowerCase()
        results = results.filter(s => s.title.toLowerCase().includes(q) || (s.artist?.toLowerCase() || '').includes(q))
      }

      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return results
    },
  })
}

export function useSong(songId: string) {
  return useQuery({
    queryKey: ['song', songId],
    queryFn: async () => {
      const data = await songRepository.getById(songId)
      if (!data) throw new Error('Song not found')
      return data as Song
    },
    enabled: !!songId,
  })
}

export function useSongAudio(songId: string) {
  return useQuery({
    queryKey: ['song_audio', songId],
    queryFn: async () => {
      const result = await songRepository.getAudio(songId)
      return result || null
    },
    enabled: !!songId,
  })
}

export function useUploadSongAudio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (audio: { song_id: string; file: File }) => {
      await songRepository.saveAudio(audio.song_id, audio.file, audio.file.name, audio.file.type)
      return { id: '', song_id: audio.song_id, blob: audio.file, name: audio.file.name, size: audio.file.size, type: audio.file.type, created_at: '' }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['song_audio', data.song_id] })
    },
  })
}

export function useCreateSong() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (song: Omit<Song, 'id'> & { id?: string }) => {
      const newSong = { ...song, id: song.id || crypto.randomUUID() } as Song
      await songRepository.create(newSong)
      return newSong
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs'] })
    },
  })
}
