/**
 * Snapshot service: hidratación inicial del cliente.
 *
 * Trae el estado completo del usuario desde el backend y lo guarda
 * en IndexedDB. Útil para:
 * - Primer login en un dispositivo
 * - Recuperación tras corrupción de DB local
 * - Sync tras período largo offline
 */

import { apiClient } from '@/lib/api/client';
import { tokenStore } from '@/lib/api/tokenStore';
import { db } from '@/lib/db';
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('SnapshotService');

interface SnapshotSong {
  id: string;
  title: string;
  artist: string | null;
  styleId: string;
  difficulty: number;
  keySignature: string;
  bpm: number;
  chordData: { sections: unknown[] };
  isPublished: boolean;
  isPreset: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SnapshotSession {
  id: string;
  userId: string;
  songId: string;
  startedAt: string;
  durationS: number;
  completed: boolean;
}

interface SnapshotEarTraining {
  id: string;
  userId: string;
  exerciseType: 'interval' | 'triad' | 'seventh_chord';
  question: { notes: string[]; root: string };
  answerGiven: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseMs: number;
  createdAt: string;
}

interface SnapshotResponse {
  user: {
    id: string;
    email: string;
    displayName: string | null;
    settings: Record<string, unknown>;
    createdAt: string;
  };
  songs: SnapshotSong[];
  practiceSessions: SnapshotSession[];
  earTrainingResults: SnapshotEarTraining[];
  styles: Array<{ id: string; name: string; difficulty: number; theoryRequired: string[]; techniques: string[]; description: string }>;
  tips: Array<{ id: string; content: string; category: string; styleId: string | null; difficultyMin: number }>;
  sharedWithMe: Array<{ id: string; songId: string; permission: string; song: unknown }>;
  serverTime: string;
  snapshotVersion: number;
}

/**
 * Aplica un snapshot sobre la base de datos local Dexie.
 * Estrategia: reemplazar las tablas del usuario pero preservar las locales
 * (preset catalogue) si el snapshot no las trae.
 */
export async function applySnapshot(snapshot: SnapshotResponse): Promise<void> {
  log.info('applySnapshot: applying', {
    songs: snapshot.songs.length,
    sessions: snapshot.practiceSessions.length,
    earTraining: snapshot.earTrainingResults.length,
  });

  await db.transaction(
    'rw',
    [db.songs, db.practice_sessions, db.ear_training_results, db.styles, db.tips, db.users],
    async () => {
      // 1. Canciones del usuario
      await db.songs.clear();
      for (const song of snapshot.songs) {
        await db.songs.add({
          id: song.id,
          title: song.title,
          artist: song.artist,
          style_id: song.styleId,
          difficulty: song.difficulty,
          key_signature: song.keySignature,
          bpm: song.bpm,
          instrument: 'piano',
          chord_data: song.chordData as { sections: Array<{ name: string; chords: Array<{ chord: string; beat: number; duration: number }> }> },
          is_published: song.isPublished,
          created_at: song.createdAt,
        });
      }

      // 2. Sesiones
      await db.practice_sessions.clear();
      for (const session of snapshot.practiceSessions) {
        await db.practice_sessions.add(session as never);
      }

      // 3. Ear training
      await db.ear_training_results.clear();
      for (const result of snapshot.earTrainingResults) {
        await db.ear_training_results.add({
          id: result.id,
          user_id: result.userId,
          exercise_type: result.exerciseType,
          question: result.question,
          answer_given: result.answerGiven,
          correct_answer: result.correctAnswer,
          is_correct: result.isCorrect,
          response_ms: result.responseMs,
          created_at: result.createdAt,
        });
      }

      // 4. Catálogo (estilos y tips) — reemplazar si vienen
      if (snapshot.styles.length > 0) {
        await db.styles.clear();
        await db.styles.bulkAdd(snapshot.styles as never);
      }
      if (snapshot.tips.length > 0) {
        await db.tips.clear();
        await db.tips.bulkAdd(snapshot.tips as never);
      }

      // 5. Perfil de usuario
      if (snapshot.user) {
        await db.users.put({
          id: snapshot.user.id,
          display_name: snapshot.user.displayName ?? snapshot.user.email.split('@')[0] ?? 'Usuario',
          pin_hash: null,
          settings: snapshot.user.settings as Record<string, unknown> as never,
          created_at: snapshot.user.createdAt,
          last_active: new Date().toISOString(),
        });
      }
    },
  );
}

/**
 * Descarga el snapshot del backend y lo aplica localmente.
 */
export async function syncFromServer(): Promise<{ applied: number; serverTime: string }> {
  if (!tokenStore.getToken()) {
    throw new Error('No autenticado');
  }

  const snapshot = await apiClient.get<SnapshotResponse>('/api/sync/snapshot');
  await applySnapshot(snapshot);

  return {
    applied:
      snapshot.songs.length +
      snapshot.practiceSessions.length +
      snapshot.earTrainingResults.length,
    serverTime: snapshot.serverTime,
  };
}
