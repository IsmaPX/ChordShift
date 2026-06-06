/**
 * Leaderboard emisor en tiempo real.
 *
 * Hooks para que el socket server pueda publicar snapshots nuevos
 * cuando el leaderboard cambia (nueva sesión, ear training, etc).
 *
 * Estrategia: NO recalculamos en cada cambio. En su lugar, los
 * controllers existentes (que ya calculan el leaderboard) llaman a
 * `broadcastLeaderboardUpdate()` después de actualizar scores.
 *
 * Esto evita acoplar el socket server a eventos de Prisma.
 */

import type { Server } from 'socket.io';
import type {
  LeaderboardCategory,
  LeaderboardPeriod,
  LeaderboardSnapshot,
} from '@chordshift/db';
import { prisma } from '../config/database.js';

let ioRef: Server | null = null;

export function attachIoForLeaderboard(io: Server): void {
  ioRef = io;
}

/**
 * Calcula el snapshot del leaderboard para una categoría/periodo.
 */
export async function computeLeaderboardSnapshot(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  currentUserId: string,
): Promise<LeaderboardSnapshot> {
  // Por ahora la lógica es la misma que en leaderboard.service.ts.
  // Se importa el helper para mantener DRY.
  const { getLeaderboard } = await import('./leaderboard.service.js');
  const result = await getLeaderboard({ category, period, limit: 50, currentUserId });
  return {
    category,
    period,
    generatedAtMs: Date.now(),
    entries: result.entries.map(e => ({
      rank: e.rank,
      userId: e.userId,
      displayName: e.displayName,
      score: e.score,
    })),
    myRank: result.myRank,
  };
}

/**
 * Emite el leaderboard actualizado a todos los clientes suscritos.
 * Llamado por los controllers después de cambios significativos.
 */
export async function broadcastLeaderboardUpdate(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  currentUserId: string,
): Promise<void> {
  if (!ioRef) return;
  const snapshot = await computeLeaderboardSnapshot(category, period, currentUserId);
  ioRef.to(`leaderboard:${category}:${period}`).emit('leaderboard:updated', snapshot);
}

/**
 * Suscribe un socket a un canal de leaderboard.
 */
export function subscribeSocketToLeaderboard(
  socketId: string,
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  io: Server,
): void {
  const s = io.sockets.sockets.get(socketId);
  if (!s) return;
  s.join(`leaderboard:${category}:${period}`);
}

export function unsubscribeSocketFromLeaderboard(
  socketId: string,
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  io: Server,
): void {
  const s = io.sockets.sockets.get(socketId);
  if (!s) return;
  s.leave(`leaderboard:${category}:${period}`);
}

// Re-export para que los tests puedan usar la lógica sin tocar prisma directamente
export { prisma };
