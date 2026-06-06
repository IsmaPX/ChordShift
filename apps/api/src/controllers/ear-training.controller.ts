/**
 * Controllers de Ear Training.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import type {
  CreateEarTrainingResultInput,
  ListEarTrainingResultsQuery,
} from '../validators/ear-training.validator.js';
import { notifyLeaderboardChanged } from '../sockets/socketServer.js';

export async function createResult(
  req: Request<{}, {}, CreateEarTrainingResultInput>,
  res: Response,
) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const result = await prisma.earTrainingResult.create({
    data: {
      userId: req.user.id,
      exerciseType: req.body.exerciseType,
      question: req.body.question,
      answerGiven: req.body.answerGiven,
      correctAnswer: req.body.correctAnswer,
      isCorrect: req.body.isCorrect,
      responseMs: req.body.responseMs,
    },
  });

  // Notificar a los suscriptores del leaderboard (best-effort, no bloqueante)
  void notifyLeaderboardChanged('ear_training_accuracy', 'all_time', req.user.id).catch(() => {});

  res.status(201).json({ result });
}

export async function listMyResults(
  req: Request<{}, {}, {}, ListEarTrainingResultsQuery>,
  res: Response,
) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const { limit = 50, offset = 0, exerciseType } = req.query;

  const where: Record<string, unknown> = { userId: req.user.id };
  if (exerciseType) where.exerciseType = exerciseType;

  const [results, total] = await Promise.all([
    prisma.earTrainingResult.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.earTrainingResult.count({ where }),
  ]);

  res.json({ results, total, limit, offset });
}

export async function getMyStats(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const [total, correct, byType] = await Promise.all([
    prisma.earTrainingResult.count({ where: { userId: req.user.id } }),
    prisma.earTrainingResult.count({ where: { userId: req.user.id, isCorrect: true } }),
    prisma.earTrainingResult.groupBy({
      by: ['exerciseType'],
      where: { userId: req.user.id },
      _count: { _all: true },
      _avg: { responseMs: true },
    }),
  ]);

  const accuracy = total > 0 ? correct / total : 0;

  res.json({
    total,
    correct,
    accuracy,
    byType: byType.map((row) => ({
      exerciseType: row.exerciseType,
      count: row._count._all,
      avgResponseMs: Math.round(row._avg.responseMs ?? 0),
    })),
  });
}
