/**
 * Controllers de Leaderboard.
 *
 * Genera rankings agregados on-the-fly desde los datos existentes.
 * Si el volumen crece, mover a materialized views o una tabla de snapshots.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import type { LeaderboardQuery } from '../validators/leaderboard.validator.js';

const PERIOD_TO_DAYS: Record<string, number | null> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  all_time: null,
};

export async function getLeaderboard(
  req: Request<{}, {}, {}, LeaderboardQuery>,
  res: Response,
) {
  const { category, period, limit } = req.query;

  // Resolver ventana de tiempo
  const days = PERIOD_TO_DAYS[period];
  const sinceDate = days !== null
    ? new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    : new Date(0);

  let entries: Array<{ userId: string; score: number; displayName: string | null }> = [];

  if (category === 'total_minutes') {
    const grouped = await prisma.practiceSession.groupBy({
      by: ['userId'],
      where: { startedAt: { gte: sinceDate } },
      _sum: { durationS: true },
    });
    const userIds = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    entries = grouped
      .map((g) => ({
        userId: g.userId,
        score: Math.round((g._sum.durationS ?? 0) / 60),
        displayName: userMap.get(g.userId)?.displayName ?? null,
      }))
      .sort((a, b) => b.score - a.score);
  } else if (category === 'sessions_completed') {
    const grouped = await prisma.practiceSession.groupBy({
      by: ['userId'],
      where: { startedAt: { gte: sinceDate }, completed: true },
      _count: { _all: true },
    });
    const userIds = grouped.map((g) => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    entries = grouped
      .map((g) => ({
        userId: g.userId,
        score: g._count._all,
        displayName: userMap.get(g.userId)?.displayName ?? null,
      }))
      .sort((a, b) => b.score - a.score);
  } else if (category === 'ear_training_accuracy') {
    const grouped = await prisma.earTrainingResult.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: sinceDate } },
      _count: { _all: true },
    });
    const userIds = grouped.map((g) => g.userId);
    const [users, correctCounts] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, displayName: true },
      }),
      Promise.all(
        grouped.map((g) =>
          prisma.earTrainingResult.count({
            where: { userId: g.userId, isCorrect: true, createdAt: { gte: sinceDate } },
          }),
        ),
      ),
    ]);
    const userMap = new Map(users.map((u) => [u.id, u]));
    entries = grouped
      .map((g, i) => {
        const total = g._count._all;
        const correct = correctCounts[i] ?? 0;
        return {
          userId: g.userId,
          score: total > 0 ? Math.round((correct / total) * 100) : 0,
          displayName: userMap.get(g.userId)?.displayName ?? null,
        };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score);
  } else {
    throw new AppError(400, 'Categoría no soportada');
  }

  const sliced = entries.slice(0, limit);

  // Encontrar la posición del usuario actual
  let myRank: number | null = null;
  if (req.user) {
    const idx = entries.findIndex((e) => e.userId === req.user!.id);
    myRank = idx >= 0 ? idx + 1 : null;
  }

  res.json({
    category,
    period,
    entries: sliced.map((e, idx) => ({
      rank: idx + 1,
      userId: e.userId,
      displayName: e.displayName,
      score: e.score,
    })),
    myRank,
  });
}
