/**
 * Servicio de sync: procesa un batch de operaciones del outbox del cliente.
 *
 * Cada operación se procesa dentro de su propia transacción de Prisma para
 * que un fallo no contamine las demás. El resultado se devuelve por
 * operación para que el cliente sepa qué items puede marcar como sincronizados.
 */

import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import type {
  SyncOperation,
  SyncOperationResult,
  SyncBatchResult,
} from '../validators/sync.validator.js';

async function applyCreateSong(
  userId: string,
  data: Extract<SyncOperation, { op: 'create_song' }>['data'],
): Promise<string> {
  const song = await prisma.song.create({
    data: {
      title: data.title,
      artist: data.artist ?? null,
      styleId: data.styleId,
      difficulty: data.difficulty,
      keySignature: data.keySignature,
      bpm: data.bpm,
      chordData: data.chordData,
      isPublished: false,
      isPreset: false,
      createdById: userId,
    },
  });
  return song.id;
}

async function applyDeleteSong(
  userId: string,
  data: Extract<SyncOperation, { op: 'delete_song' }>['data'],
): Promise<string> {
  const song = await prisma.song.findUnique({ where: { id: data.id } });
  if (!song) return data.id; // Idempotente: ya no existe
  if (song.createdById !== userId) {
    throw new AppError(403, 'No autorizado');
  }
  await prisma.song.delete({ where: { id: data.id } });
  return data.id;
}

async function applyCreateSession(
  userId: string,
  data: Extract<SyncOperation, { op: 'create_session' }>['data'],
): Promise<string> {
  const session = await prisma.practiceSession.create({
    data: {
      userId,
      songId: data.songId,
      startedAt: new Date(data.startedAt),
      durationS: data.durationS,
      completed: data.completed,
    },
  });
  return session.id;
}

async function applyCreateEarTraining(
  userId: string,
  data: Extract<SyncOperation, { op: 'create_ear_training' }>['data'],
): Promise<string> {
  const result = await prisma.earTrainingResult.create({
    data: {
      userId,
      exerciseType: data.exerciseType,
      question: data.question,
      answerGiven: data.answerGiven,
      correctAnswer: data.correctAnswer,
      isCorrect: data.isCorrect,
      responseMs: data.responseMs,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    },
  });
  return result.id;
}

async function applyAddXp(
  userId: string,
  data: Extract<SyncOperation, { op: 'add_xp' }>['data'],
): Promise<string> {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  });
  if (!current) throw new AppError(404, 'Usuario no encontrado');

  const settings = current.settings as Record<string, unknown>;
  const currentXp = typeof settings.xp === 'number' ? settings.xp : 0;

  await prisma.user.update({
    where: { id: userId },
    data: { settings: { ...settings, xp: currentXp + data.xp } },
  });

  return userId;
}

async function applyUpdateSettings(
  userId: string,
  data: Extract<SyncOperation, { op: 'update_settings' }>['data'],
): Promise<string> {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  });
  if (!current) throw new AppError(404, 'Usuario no encontrado');

  const settings = current.settings as Record<string, unknown>;
  await prisma.user.update({
    where: { id: userId },
    data: { settings: { ...settings, ...data } },
  });

  return userId;
}

export async function processSyncBatch(
  userId: string,
  operations: SyncOperation[],
): Promise<SyncBatchResult> {
  const results: SyncOperationResult[] = [];

  for (const op of operations) {
    try {
      let serverId: string;

      switch (op.op) {
        case 'create_song':
          serverId = await applyCreateSong(userId, op.data);
          break;
        case 'delete_song':
          serverId = await applyDeleteSong(userId, op.data);
          break;
        case 'create_session':
          serverId = await applyCreateSession(userId, op.data);
          break;
        case 'create_ear_training':
          serverId = await applyCreateEarTraining(userId, op.data);
          break;
        case 'add_xp':
          serverId = await applyAddXp(userId, op.data);
          break;
        case 'update_settings':
          serverId = await applyUpdateSettings(userId, op.data);
          break;
        default: {
          // Exhaustiveness check
          const _exhaustive: never = op;
          void _exhaustive;
          throw new AppError(400, 'Operación no soportada');
        }
      }

      results.push({ clientId: op.clientId, op: op.op, status: 'applied', serverId });
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'Error al aplicar operación';
      const code = err instanceof AppError ? err.statusCode : 500;
      results.push({
        clientId: op.clientId,
        op: op.op,
        status: code >= 400 && code < 500 ? 'rejected' : 'error',
        error: message,
      });
    }
  }

  return {
    applied: results.filter((r) => r.status === 'applied').length,
    rejected: results.filter((r) => r.status === 'rejected').length,
    errors: results.filter((r) => r.status === 'error').length,
    results,
    serverTime: new Date().toISOString(),
  };
}
