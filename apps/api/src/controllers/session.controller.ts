/**
 * Controllers de Practice Sessions.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateSessionInput } from '../validators/session.validator.js';
import { notifyLeaderboardChanged } from '../sockets/socketServer.js';

export async function listSessions(req: Request<{ userId: string }>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');
  if (req.params.userId !== req.user.id) {
    throw new AppError(403, 'No autorizado');
  }

  const sessions = await prisma.practiceSession.findMany({
    where: { userId: req.params.userId },
    orderBy: { startedAt: 'desc' },
    take: 100,
  });
  res.json({ sessions });
}

export async function createSession(req: Request<{}, {}, CreateSessionInput>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const session = await prisma.practiceSession.create({
    data: {
      userId: req.user.id,
      songId: req.body.songId,
      durationS: req.body.durationS,
      completed: req.body.completed,
    },
  });

  // Notificar a los suscriptores del leaderboard (best-effort, no bloqueante)
  void notifyLeaderboardChanged('sessions_completed', 'all_time', req.user.id).catch(() => {});
  void notifyLeaderboardChanged('total_minutes', 'all_time', req.user.id).catch(() => {});

  res.status(201).json({ session });
}

export async function getUserStats(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const [totalSessions, totalMinutes, completedSessions, sessionsByDay] = await Promise.all([
    prisma.practiceSession.count({ where: { userId: req.user.id } }),
    prisma.practiceSession.aggregate({
      where: { userId: req.user.id },
      _sum: { durationS: true },
    }),
    prisma.practiceSession.count({
      where: { userId: req.user.id, completed: true },
    }),
    prisma.practiceSession.groupBy({
      by: ['startedAt'],
      where: { userId: req.user.id },
      _count: true,
    }),
  ]);

  res.json({
    totalSessions,
    totalMinutes: Math.round((totalMinutes._sum.durationS ?? 0) / 60),
    completedSessions,
    uniqueDays: sessionsByDay.length,
  });
}
