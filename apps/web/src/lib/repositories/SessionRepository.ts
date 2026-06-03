import type { IPracticeSessionRepository } from './interfaces'
import type { PracticeSession } from '@/types/music'
import { db } from '@/lib/db'

export class PracticeSessionRepository implements IPracticeSessionRepository {
  async getAll(): Promise<PracticeSession[]> {
    return db.practice_sessions.toArray()
  }

  async getById(id: string): Promise<PracticeSession | undefined> {
    return db.practice_sessions.get(id)
  }

  async getBySongId(songId: string): Promise<PracticeSession[]> {
    return db.practice_sessions.where('song_id').equals(songId).toArray()
  }

  async getByUserId(userId: string): Promise<PracticeSession[]> {
    return db.practice_sessions.where('user_id').equals(userId).toArray()
  }

  async create(data: Omit<PracticeSession, 'id'> & { id: string }): Promise<PracticeSession> {
    const session: PracticeSession = data as PracticeSession
    await db.practice_sessions.add(session)
    return session
  }

  async update(id: string, data: Partial<PracticeSession>): Promise<void> {
    await db.practice_sessions.update(id, data)
  }

  async deleteByUserId(userId: string): Promise<void> {
    const sessions = await this.getByUserId(userId)
    await db.practice_sessions.bulkDelete(sessions.map((s) => s.id))
  }
}

export const practiceSessionRepository = new PracticeSessionRepository()
