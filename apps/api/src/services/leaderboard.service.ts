/**
 * Servicio de leaderboard.
 *
 * Combina dos estrategias:
 * 1. **Cálculo en vivo**: para queries poco frecuentes o cuando el
 *    cache está stale. Usa agregaciones sobre las tablas de origen
 *    (practice_sessions, ear_training_results).
 * 2. **Cache pre-calculado**: para queries frecuentes. La tabla
 *    `leaderboard_snapshot_cache` contiene snapshots con TTL. El job
 *    `refreshLeaderboardCache()` la actualiza.
 *
 * El `getLeaderboard` primero busca en cache; si está expired o no
 * existe, recalcula en vivo y (opcionalmente) refresca el cache.
 */

import { prisma } from '../config/database.js';
import type {
  LeaderboardCategory,
  LeaderboardPeriod,
  LeaderboardEntry,
} from '@chordshift/db';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const LEADERBOARD_LIMIT = 100;

export type LeaderboardResult = {
  entries: LeaderboardEntry[];
  myRank: number | null;
  totalUsers: number;
  fromCache: boolean;
  generatedAtMs: number;
};

const PERIOD_DAYS: Record<LeaderboardPeriod, number | null> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  all_time: null,
};

/**
 * Calcula el score para un usuario y categoría dados.
 * Cada categoría tiene su propia fórmula:
 * - total_minutes: suma de durationS / 60
 * - sessions_completed: count(*) where completed=true
 * - ear_training_accuracy: count(isCorrect) / count(*) * 100
 */
async function calculateScores(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
): Promise<Map<string, number>> {
  const days = PERIOD_DAYS[period];
  const dateFilter = days ? { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } : undefined;

  const scores = new Map<string, number>();

  if (category === 'total_minutes') {
    const rows = await prisma.practiceSession.groupBy({
      by: ['userId'],
      where: dateFilter ? { startedAt: dateFilter } : undefined,
      _sum: { durationS: true },
    });
    for (const row of rows) {
      scores.set(row.userId, Math.round((row._sum.durationS ?? 0) / 60));
    }
  } else if (category === 'sessions_completed') {
    const rows = await prisma.practiceSession.groupBy({
      by: ['userId'],
      where: { completed: true, ...(dateFilter ? { startedAt: dateFilter } : {}) },
      _count: { _all: true },
    });
    for (const row of rows) {
      scores.set(row.userId, row._count._all);
    }
  } else if (category === 'ear_training_accuracy') {
    const rows = await prisma.earTrainingResult.groupBy({
      by: ['userId'],
      where: dateFilter ? { createdAt: dateFilter } : undefined,
      _count: { _all: true },
    });
    // Necesitamos el count de correct para calcular accuracy
    await Promise.all(
      rows.map(async row => {
        const correct = await prisma.earTrainingResult.count({
          where: { userId: row.userId, isCorrect: true, ...(dateFilter ? { createdAt: dateFilter } : {}) },
        });
        const total = row._count._all;
        scores.set(row.userId, total > 0 ? Math.round((correct / total) * 100) : 0);
      }),
    );
  }

  return scores;
}

/**
 * Busca un snapshot en cache. Devuelve null si no existe o está expired.
 */
async function getFromCache(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
): Promise<LeaderboardResult | null> {
  const cached = await prisma.leaderboardSnapshotCache.findUnique({
    where: { category_period: { category, period } },
  });
  if (!cached) return null;
  if (cached.expiresAt < new Date()) return null;

  const payload = cached.payload as unknown as {
    entries: LeaderboardEntry[];
    myRanks: Record<string, number>;
  };

  return {
    entries: payload.entries,
    myRank: null, // Se calcula por separado abajo
    totalUsers: cached.totalUsers,
    fromCache: true,
    generatedAtMs: cached.generatedAt.getTime(),
  };
}

export async function getLeaderboard(params: {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  limit?: number;
  currentUserId?: string;
}): Promise<LeaderboardResult> {
  const { category, period, limit = LEADERBOARD_LIMIT, currentUserId } = params;

  // 1) Intentar cache
  const cached = await getFromCache(category, period);

  let entries: LeaderboardEntry[];
  let totalUsers: number;
  let generatedAtMs: number;

  if (cached) {
    entries = cached.entries.slice(0, limit);
    totalUsers = cached.totalUsers;
    generatedAtMs = cached.generatedAtMs;
  } else {
    // 2) Calcular en vivo
    const scores = await calculateScores(category, period);
    const sorted = Array.from(scores.entries())
      .map(([userId, score]) => ({ userId, score }))
      .sort((a, b) => b.score - a.score);

    // Necesitamos los displayNames — fetch en bulk
    const userIds = sorted.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true },
    });
    const userMap = new Map(users.map(u => [u.id, u.displayName]));

    entries = sorted
      .slice(0, limit)
      .map((s, idx) => ({
        rank: idx + 1,
        userId: s.userId,
        displayName: userMap.get(s.userId) ?? null,
        score: s.score,
      }));
    totalUsers = sorted.length;
    generatedAtMs = Date.now();
  }

  // Calcular myRank (siempre en vivo, no cacheado)
  let myRank: number | null = null;
  if (currentUserId) {
    const scores = await calculateScores(category, period);
    const sorted = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    const idx = sorted.findIndex(([userId]) => userId === currentUserId);
    if (idx >= 0) myRank = idx + 1;
  }

  return {
    entries,
    myRank,
    totalUsers,
    fromCache: !!cached,
    generatedAtMs,
  };
}

/**
 * Refresca la cache para una combinación de category+period.
 * Llamado por el job `startLeaderboardCacheJob()` o manualmente
 * tras cambios importantes.
 */
export async function refreshLeaderboardCache(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
): Promise<{ entries: number; totalUsers: number }> {
  const scores = await calculateScores(category, period);
  const sorted = Array.from(scores.entries())
    .map(([userId, score]) => ({ userId, score }))
    .sort((a, b) => b.score - a.score);

  const userIds = sorted.map(s => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, displayName: true },
  });
  const userMap = new Map(users.map(u => [u.id, u.displayName]));

  const entries = sorted.map((s, idx) => ({
    rank: idx + 1,
    userId: s.userId,
    displayName: userMap.get(s.userId) ?? null,
    score: s.score,
  }));

  const now = new Date();
  const expires = new Date(now.getTime() + CACHE_TTL_MS);

  await prisma.leaderboardSnapshotCache.upsert({
    where: { category_period: { category, period } },
    create: {
      category,
      period,
      generatedAt: now,
      expiresAt: expires,
      payload: { entries, myRanks: {} },
      totalUsers: entries.length,
    },
    update: {
      generatedAt: now,
      expiresAt: expires,
      payload: { entries, myRanks: {} },
      totalUsers: entries.length,
    },
  });

  return { entries: entries.length, totalUsers: entries.length };
}

let jobInterval: NodeJS.Timeout | null = null;

/**
 * Inicia el job periódico que refresca la cache de leaderboard.
 * Llamar una sola vez al boot del server.
 */
export function startLeaderboardCacheJob(): void {
  if (jobInterval) return;

  const CATEGORIES: LeaderboardCategory[] = ['total_minutes', 'sessions_completed', 'ear_training_accuracy'];
  const PERIODS: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'all_time'];

  const refresh = async () => {
    for (const category of CATEGORIES) {
      for (const period of PERIODS) {
        try {
          await refreshLeaderboardCache(category, period);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[leaderboard] failed to refresh ${category}/${period}:`, err);
        }
      }
    }
    // eslint-disable-next-line no-console
    console.log(`[leaderboard] cache refreshed (${CATEGORIES.length * PERIODS.length} snapshots)`);
  };

  // Refrescar al boot
  void refresh();

  // Y cada CACHE_TTL_MS / 2 para que el cache nunca expire antes del próximo refresh
  jobInterval = setInterval(refresh, CACHE_TTL_MS / 2);
  jobInterval.unref?.();
}

/** Sólo para tests. */
export function __stopLeaderboardCacheJobForTests(): void {
  if (jobInterval) {
    clearInterval(jobInterval);
    jobInterval = null;
  }
}
