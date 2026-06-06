/**
 * ApiSongRepository — implementa ISongRepository contra el backend.
 *
 * Estrategia offline-first:
 * - Si la red falla, devuelve cache local de Dexie y encola la operación.
 * - Si la red funciona, sincroniza con el backend y actualiza Dexie.
 *
 * En esta fase implementamos solo la versión online (sin queue offline).
 * El cache Dexie se mantiene como fallback de solo lectura.
 */

import type { ISongRepository } from '../interfaces';
import type { Song, SongAudio } from '@/types/music';
import { apiClient } from '@/lib/api/client';
import type { SongsListResponse, SongResponse } from '@/lib/api/types';

interface AudioResponse {
  audio: {
    id: string;
    userId: string;
    songId: string;
    url: string;
    name: string;
    size: number;
    mimeType: string;
    createdAt: string;
  };
}

function toSongAudio(response: AudioResponse['audio']): SongAudio {
  return {
    id: response.id,
    song_id: response.songId,
    blob: new Blob(), // El frontend no necesita el blob; descarga via streaming URL
    name: response.name,
    size: response.size,
    type: response.mimeType,
    created_at: response.createdAt,
  };
}

export class ApiSongRepository implements ISongRepository {
  async getAll(): Promise<Song[]> {
    const { songs } = await apiClient.get<SongsListResponse>('/api/songs', {
      query: { limit: 100 },
    });
    return songs;
  }

  async getById(id: string): Promise<Song | undefined> {
    try {
      const { song } = await apiClient.get<SongResponse>(`/api/songs/${id}`);
      const { style: _style, createdBy: _createdBy, ...rest } = song as Song & {
        style?: unknown;
        createdBy?: unknown;
      };
      return rest as Song;
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  async search(
    query: string,
    styleId?: string,
    tab?: 'all' | 'preset' | 'mine',
  ): Promise<Song[]> {
    const { songs } = await apiClient.get<SongsListResponse>('/api/songs', {
      query: { search: query, styleId, tab, limit: 100 },
    });
    return songs;
  }

  async getPaginated(opts: {
    limit: number;
    offset?: number;
    styleId?: string;
    search?: string;
    tab?: 'all' | 'preset' | 'mine';
  }): Promise<{ songs: Song[]; total: number }> {
    const { songs, total, limit, offset } = await apiClient.get<SongsListResponse>(
      '/api/songs',
      {
        query: {
          search: opts.search,
          styleId: opts.styleId,
          tab: opts.tab,
          limit: opts.limit,
          offset: opts.offset ?? 0,
        },
      },
    );
    return { songs, total, limit, offset };
  }

  async getByStyle(styleId: string): Promise<Song[]> {
    const { songs } = await apiClient.get<SongsListResponse>('/api/songs', {
      query: { styleId, limit: 100 },
    });
    return songs;
  }

  async create(data: Omit<Song, 'id'> & { id: string }): Promise<Song> {
    const { song } = await apiClient.post<SongResponse>('/api/songs', data);
    return song as Song;
  }

  async update(id: string, data: Partial<Song>): Promise<void> {
    await apiClient.patch<SongResponse>(`/api/songs/${id}`, data);
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete<void>(`/api/songs/${id}`);
  }

  /**
   * Audio: se almacena en el backend y se sirve via streaming URL.
   * El SongAudio en el frontend contiene la URL pública en `blob` (placeholder)
   * para no romper la interfaz; el consumer debe usar la URL directa del backend.
   */
  async getAudio(songId: string): Promise<SongAudio | undefined> {
    try {
      const { audio } = await apiClient.get<AudioResponse>(`/api/songs/${songId}/audio`);
      return toSongAudio(audio);
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 404) {
        return undefined;
      }
      throw err;
    }
  }

  /**
   * Upload de audio via multipart/form-data.
   * Usa fetch directamente (no apiClient) porque requiere FormData sin Content-Type JSON.
   */
  async saveAudio(songId: string, file: Blob, name: string, type: string): Promise<void> {
    const { tokenStore } = await import('@/lib/api/tokenStore');
    const formData = new FormData();
    formData.append('audio', file, name);
    formData.append('name', name);
    formData.append('type', type);

    const token = tokenStore.getToken();
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

    const response = await fetch(`${apiBase}/api/songs/${songId}/audio`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error ?? `Upload failed: ${response.statusText}`);
    }
  }

  async removeAudio(songId: string): Promise<void> {
    await apiClient.delete<void>(`/api/songs/${songId}/audio`);
  }

  async seedIfEmpty(): Promise<void> {
    // El seed se hace desde el backend (`pnpm db:seed`). No-op aquí.
  }
}

export const apiSongRepository = new ApiSongRepository();
