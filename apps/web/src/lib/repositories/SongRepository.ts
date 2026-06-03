import type { ISongRepository } from './interfaces'
import type { Song, SongAudio } from '@/types/music'
import { db } from '@/lib/db'
import { SEED_SONGS } from '@/data/songs'

export class SongRepository implements ISongRepository {
  async getAll(): Promise<Song[]> {
    return db.songs.toArray()
  }

  async getById(id: string): Promise<Song | undefined> {
    return db.songs.get(id)
  }

  async search(query: string, styleId?: string, tab?: 'all' | 'preset' | 'mine'): Promise<Song[]> {
    let collection = db.songs.orderBy('title')

    if (styleId) {
      collection = db.songs.where('style_id').equals(styleId) as typeof collection
    }

    let results = await collection.toArray()

    if (query) {
      const lowerQuery = query.toLowerCase()
      results = results.filter(
        (s) => s.title.toLowerCase().includes(lowerQuery) || s.artist?.toLowerCase().includes(lowerQuery)
      )
    }

    if (tab === 'preset') {
      results = results.filter((s) => s.is_published)
    } else if (tab === 'mine') {
      results = results.filter((s) => !s.is_published)
    }

    return results
  }

  async getPaginated(opts: { limit: number; offset?: number; styleId?: string; search?: string; tab?: 'all' | 'preset' | 'mine' }): Promise<{ songs: Song[]; total: number }> {
    const { limit = 20, offset = 0, styleId, search, tab } = opts

    let results = await db.songs.orderBy('created_at').reverse().toArray()

    if (styleId) {
      results = results.filter(s => s.style_id === styleId)
    }

    if (search) {
      const lower = search.toLowerCase()
      results = results.filter(s =>
        s.title.toLowerCase().includes(lower) ||
        (s.artist?.toLowerCase().includes(lower) ?? false)
      )
    }

    if (tab === 'preset') {
      results = results.filter(s => s.is_published)
    } else if (tab === 'mine') {
      results = results.filter(s => !s.is_published)
    }

    const total = results.length
    const paginated = results.slice(offset, offset + limit)

    return { songs: paginated, total }
  }

  async getByStyle(styleId: string): Promise<Song[]> {
    return db.songs.where('style_id').equals(styleId).toArray()
  }

  async create(data: Omit<Song, 'id'> & { id: string }): Promise<Song> {
    const id = data.id
    const song: Song = { ...data, id }
    await db.songs.add(song as Song)
    return song
  }

  async update(id: string, data: Partial<Song>): Promise<void> {
    await db.songs.update(id, data)
  }

  async remove(id: string): Promise<void> {
    await db.songs.delete(id)
  }

  async getAudio(songId: string): Promise<SongAudio | undefined> {
    return db.song_audio.where('song_id').equals(songId).first()
  }

  async saveAudio(songId: string, file: Blob, name: string, type: string): Promise<void> {
    const existing = await this.getAudio(songId)
    const entry: SongAudio = {
      id: existing?.id || crypto.randomUUID(),
      song_id: songId,
      blob: file,
      name,
      size: file.size,
      type,
      created_at: existing?.created_at || new Date().toISOString(),
    }
    await db.song_audio.put(entry)
  }

  async removeAudio(songId: string): Promise<void> {
    const existing = await this.getAudio(songId)
    if (existing?.id) {
      await db.song_audio.delete(existing.id)
    }
  }

  async seedIfEmpty(): Promise<void> {
    const count = await db.songs.count()
    if (count === 0) {
      await db.songs.bulkAdd(SEED_SONGS as Song[]).catch(() => {})
    }
  }
}

export const songRepository = new SongRepository()
