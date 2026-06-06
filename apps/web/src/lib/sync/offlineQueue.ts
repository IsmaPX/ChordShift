/**
 * Wrapper decorator que añade sync offline-first a los repositorios API.
 *
 * Patrón: en lugar de llamar directamente a la API, el wrapper:
 * 1. Aplica el cambio localmente (optimistic update en Dexie)
 * 2. Encola la operación en el outbox
 * 3. El syncManager se encarga de empujarlo al backend cuando hay red
 *
 * Si la operación online directa tiene éxito (estamos online + backend OK),
 * también funciona — el wrapper es transparente.
 *
 * Trade-off: duplicación de lógica con el repositorio Dexie.
 * Para minimizar código, este wrapper SOLO enqueue, y los repositorios
 * base son los que deciden si aplicar local o esperar al sync.
 */

import { syncManager } from './syncManager';
import { outboxRepository, type OutboxOpName } from './outbox';
import type { Song, PracticeSession } from '@/types/music';
import type { EarTrainingResult } from '@/lib/db';
import type { UserSettings } from '@/types/music';

interface SongCreateData {
  title: string;
  artist: string | null;
  style_id: string;
  difficulty: number;
  key_signature: string;
  bpm: number;
  chord_data: { sections: Array<{ name: string; chords: Array<{ chord: string; beat: number; duration: number }> }> };
  is_published: boolean;
}

export const offlineQueue = {
  /**
   * Crea una canción: la guarda localmente y encola la operación.
   * El syncManager la empujará al backend cuando haya red.
   */
  async createSong(data: SongCreateData, _userId: string): Promise<string> {
    const id = crypto.randomUUID();
    // El caller persiste la canción en su repositorio local. Aquí sólo
    // encolamos la operación para sincronizar.
    const _songPayload: Song = {
      id,
      ...data,
      instrument: 'piano',
      created_at: new Date().toISOString(),
    };
    void _songPayload;

    // Persistir local (Dexie) - el caller debe haber añadido la canción a su repositorio
    // El sync manager solo se encarga de propagar al backend.

    await syncManager.enqueue('create_song', {
      title: data.title,
      artist: data.artist,
      styleId: data.style_id,
      difficulty: data.difficulty,
      keySignature: data.key_signature,
      bpm: data.bpm,
      chordData: data.chord_data,
    });

    return id;
  },

  async deleteSong(songId: string): Promise<void> {
    await syncManager.enqueue('delete_song', { id: songId });
  },

  async createSession(session: Omit<PracticeSession, 'id'> & { id: string }): Promise<void> {
    await syncManager.enqueue('create_session', {
      songId: session.song_id,
      startedAt: session.started_at,
      durationS: session.duration_s,
      completed: session.completed,
    });
  },

  async createEarTrainingResult(result: EarTrainingResult): Promise<void> {
    await syncManager.enqueue('create_ear_training', {
      exerciseType: result.exercise_type,
      question: result.question,
      answerGiven: result.answer_given,
      correctAnswer: result.correct_answer,
      isCorrect: result.is_correct,
      responseMs: result.response_ms,
      createdAt: result.created_at,
    });
  },

  async addXp(xp: number): Promise<void> {
    await syncManager.enqueue('add_xp', { xp });
  },

  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    await syncManager.enqueue('update_settings', settings);
  },

  /**
   * Estado del outbox — útil para la UI.
   */
  async getPendingCount(): Promise<number> {
    return outboxRepository.countPending();
  },
};

export type { OutboxOpName };
