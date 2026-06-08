/**
 * Servicio de sesiones en vivo (capa de datos + Prisma).
 *
 * Este servicio SÓLO persiste metadata de auditoría. El estado en tiempo
 * real (beats, participantes conectados) vive en `liveSessionRegistry`.
 *
 * Reglas:
 * - Cada sesión pertenece a un host.
 * - Sólo el host puede pausar / reanudar / finalizar.
 * - Al finalizar (host o TTL), se actualiza `endedAt` en Prisma (auditoría).
 *
 * Lifecycle:
 * - El registry emite `created` / `ended` (host/ttl) via `onLifecycle`.
 * - El service se suscribe para persistir `endedAt` automáticamente.
 * - En boot, `recoverFromDatabase()` rehidrata el registry con sesiones
 *   que quedaron activas tras un restart.
 */

import { prisma } from '../config/database.js';
import { liveSessionRegistry } from '../sockets/liveSession.registry.js';
import type { LiveSessionStatePayload, SocketUser } from '../sockets/socket.types.js';

export class LiveSessionServiceError extends Error {
  constructor(public readonly code: 'NOT_FOUND' | 'FORBIDDEN' | 'INVALID', message: string) {
    super(message);
    this.name = 'LiveSessionServiceError';
  }
}

export type CreateSessionInput = {
  hostId: string;
  songId: string;
  bpm: number;
};

let lifecycleUnsub: (() => void) | null = null;

function installLifecycleHook(): void {
  // Si ya estamos suscritos, no reinstalamos.
  // Si el registry se reseteó (tests), `lifecycleUnsub` ya no apunta a
  // nada útil — el unsubscribe es un no-op, pero el listener ya no existe
  // en el registry. Por tanto re-suscribimos siempre.
  if (lifecycleUnsub) {
    try {
      lifecycleUnsub();
    } catch {
      // Ignorar — el listener ya no existe
    }
    lifecycleUnsub = null;
  }

  lifecycleUnsub = liveSessionRegistry.onLifecycle(event => {
    if (event.type === 'ended') {
      // Persistir endedAt (fire & forget — la registry es autoritativa)
      prisma.liveSession
        .update({
          where: { id: event.sessionId },
          data: { status: 'ended', endedAt: new Date() },
        })
        .catch(err => {
          console.error(`[liveSession] failed to persist endedAt for ${event.sessionId}:`, err);
        });
    }
  });
}

export async function createSession(input: CreateSessionInput): Promise<LiveSessionStatePayload> {
  installLifecycleHook();

  // Validar que la canción existe
  const song = await prisma.song.findUnique({
    where: { id: input.songId },
    select: { id: true, bpm: true },
  });
  if (!song) {
    throw new LiveSessionServiceError('NOT_FOUND', 'Canción no encontrada');
  }

  const host = await prisma.user.findUnique({
    where: { id: input.hostId },
    select: { id: true, email: true, displayName: true },
  });
  if (!host) {
    throw new LiveSessionServiceError('NOT_FOUND', 'Host no encontrado');
  }

  // Crear registro de auditoría
  const record = await prisma.liveSession.create({
    data: {
      hostId: input.hostId,
      songId: input.songId,
      bpm: input.bpm || song.bpm,
      status: 'active',
    },
  });

  const state: Omit<LiveSessionStatePayload, 'participants'> = {
    sessionId: record.id,
    hostId: input.hostId, // Usar el id solicitado (ya validado que existe)
    songId: song.id,
    status: 'active',
    currentBeat: 0,
    bpm: record.bpm,
    startedAtMs: record.startedAt.getTime(),
  };

  return liveSessionRegistry.create(state);
}

export async function getSession(sessionId: string): Promise<LiveSessionStatePayload | null> {
  installLifecycleHook();

  // Primero en memoria (más rápido y autoritativo para estado en tiempo real)
  const live = liveSessionRegistry.get(sessionId);
  if (live) return live;

  // Si no está en memoria, comprobar en DB y reconstruir (caso: server restart)
  const record = await prisma.liveSession.findUnique({
    where: { id: sessionId },
    include: { host: { select: { id: true, email: true, displayName: true } } },
  });
  if (!record || record.status === 'ended') return null;

  return liveSessionRegistry.create({
    sessionId: record.id,
    hostId: record.hostId,
    songId: record.songId,
    status: 'active',
    currentBeat: record.currentBeat,
    bpm: record.bpm,
    startedAtMs: record.startedAt.getTime(),
  });
}

export async function endSession(sessionId: string, byUserId: string): Promise<void> {
  const result = liveSessionRegistry.end(sessionId, byUserId);
  if (!result.ok) {
    throw new LiveSessionServiceError('FORBIDDEN', result.error ?? 'No se pudo finalizar');
  }
  // El update a Prisma se hace via lifecycle hook (evento 'ended').
}

/**
 * Devuelve todas las sesiones activas de un host, tanto en el registry
 * (en tiempo real) como en la DB (auditoría / sesiones en estado paused
 * pero con sockets conectados).
 */
export async function listHostActiveSessions(hostId: string): Promise<LiveSessionStatePayload[]> {
  installLifecycleHook();

  // 1) Sesiones activas en el registry (autoritativas en memoria)
  const inMemory = liveSessionRegistry
    .list()
    .filter(s => s.hostId === hostId && s.status !== 'ended');

  if (inMemory.length > 0) {
    return inMemory;
  }

  // 2) Fallback a DB: sesiones con status=active en Prisma
  const records = await prisma.liveSession.findMany({
    where: { hostId, status: 'active' },
    orderBy: { startedAt: 'desc' },
    take: 20,
  });

  // Defensivo: si la query falla o no hay nada, devolver array vacío
  if (!records || records.length === 0) {
    return [];
  }

  // Reconstruir en el registry para que esté disponible
  return records.map(r =>
    liveSessionRegistry.create({
      sessionId: r.id,
      hostId: r.hostId,
      songId: r.songId,
      status: r.status as 'active',
      currentBeat: r.currentBeat,
      bpm: r.bpm,
      startedAtMs: r.startedAt.getTime(),
    }),
  );
}

export async function updateBeat(
  sessionId: string,
  beat: number,
): Promise<{ emittedAtMs: number } | null> {
  const payload = liveSessionRegistry.updateBeat(sessionId, beat);
  if (!payload) return null;

  // Persistir último beat (best-effort, no bloqueante para el caller)
  prisma.liveSession
    .update({ where: { id: sessionId }, data: { currentBeat: beat } })
    .catch(() => {
      // Silenciar — el estado real está en memoria
    });

  return { emittedAtMs: payload.emittedAtMs };
}

export function resolveSocketUser(
  user: { id: string; email: string; displayName: string | null } | null,
): SocketUser | null {
  if (!user) return null;
  return { id: user.id, email: user.email, displayName: user.displayName };
}

/**
 * Recupera sesiones activas de la base de datos tras un restart del server.
 *
 * Llamar UNA VEZ al boot del server. Las sesiones recuperadas:
 * - Vuelven a estar en el registry (autoritativas en memoria)
 * - Mantienen su TTL desde el momento de la recuperación
 * - Si tienen más de SESSION_TTL_MS sin actividad, se marcan como `ended`
 *
 * Devuelve el número de sesiones recuperadas.
 */
export async function recoverFromDatabase(): Promise<number> {
  installLifecycleHook();

  const maxAgeMs = (await import('../config/env.js')).env.SESSION_TTL_MS;
  const cutoff = new Date(Date.now() - maxAgeMs);

  const records = await prisma.liveSession.findMany({
    where: {
      status: 'active',
      startedAt: { gte: cutoff }, // Sólo sesiones recientes
    },
    include: { host: { select: { id: true, email: true, displayName: true } } },
  });

  for (const r of records) {
    liveSessionRegistry.create({
      sessionId: r.id,
      hostId: r.hostId,
      songId: r.songId,
      status: r.status as 'active',
      currentBeat: r.currentBeat,
      bpm: r.bpm,
      startedAtMs: r.startedAt.getTime(),
    });
  }

  return records.length;
}
