/**
 * ApiPracticeSessionRepository — sesiones de práctica contra el backend.
 */

import type { IPracticeSessionRepository } from '../interfaces';
import type { PracticeSession } from '@/types/music';
import { apiClient } from '@/lib/api/client';
import { tokenStore } from '@/lib/api/tokenStore';
import type { SessionsListResponse, SessionResponse } from '@/lib/api/types';

function getCurrentUserId(): string | null {
  return tokenStore.getUser()?.id ?? null;
}

export class ApiPracticeSessionRepository implements IPracticeSessionRepository {
  async getAll(): Promise<PracticeSession[]> {
    const user = getCurrentUserId();
    if (!user) return [];
    return this.getByUserId(user);
  }

  async getById(_id: string): Promise<PracticeSession | undefined> {
    // No hay GET por id. Devolvemos undefined (la interfaz lo permite).
    return undefined;
  }

  async getBySongId(songId: string): Promise<PracticeSession[]> {
    const all = await this.getAll();
    return all.filter((s) => s.song_id === songId);
  }

  async getByUserId(userId: string): Promise<PracticeSession[]> {
    const { sessions } = await apiClient.get<SessionsListResponse>(
      `/api/sessions/user/${userId}`,
    );
    return sessions;
  }

  async create(data: Omit<PracticeSession, 'id'> & { id: string }): Promise<PracticeSession> {
    const { session } = await apiClient.post<SessionResponse>('/api/sessions', {
      songId: data.song_id,
      durationS: data.duration_s,
      completed: data.completed,
    });
    return session;
  }

  async update(_id: string, _data: Partial<PracticeSession>): Promise<void> {
    // El backend actual no expone PATCH /sessions/:id — no-op silencioso.
    // Si necesitas esta operación, añadir endpoint en apps/api.
  }

  async deleteByUserId(userId: string): Promise<void> {
    // El backend no expone DELETE /sessions/user/:userId todavía.
    // La limpieza al borrar perfil se hace en cascada via Prisma en el futuro.
    void userId;
  }
}

export const apiPracticeSessionRepository = new ApiPracticeSessionRepository();
