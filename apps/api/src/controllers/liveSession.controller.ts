/**
 * Controller REST para sesiones en vivo.
 *
 * Endpoints:
 * - POST /api/live-sessions  → crear sesión (sólo host)
 * - GET  /api/live-sessions  → listar sesiones activas del host actual
 * - GET  /api/live-sessions/:id → estado actual
 * - POST /api/live-sessions/:id/end → finalizar
 *
 * El control fino (pause, resume, beats) se hace por Socket.IO,
 * no por REST. La única excepción es `end` para que clientes sin
 * socket puedan cerrar la sesión.
 *
 * Multi-sesión: el host puede tener N sesiones activas simultáneamente
 * (cada una con su propio songId/participantes).
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import {
  createSession,
  endSession,
  getSession,
  listHostActiveSessions,
  LiveSessionServiceError,
} from '../services/liveSession.service.js';

const createSchema = z.object({
  songId: z.string().uuid('songId debe ser UUID'),
  bpm: z.number().int().min(20).max(300).optional(),
});

export async function postLiveSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    }
    const state = await createSession({ hostId: userId, songId: parsed.data.songId, bpm: parsed.data.bpm ?? 0 });
    res.status(201).json({ state });
  } catch (err) {
    if (err instanceof LiveSessionServiceError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 403;
      return res.status(status).json({ error: err.message });
    }
    next(err);
  }
}

export async function getMyActiveSessions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const sessions = await listHostActiveSessions(userId);
    res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

export async function getLiveSession(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id requerido' });
    const state = await getSession(id);
    if (!state) return res.status(404).json({ error: 'Sesión no encontrada' });
    res.json({ state });
  } catch (err) {
    next(err);
  }
}

export async function postEndLiveSession(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id requerido' });

    // Verificar que el usuario es el host antes de finalizar
    const session = await prisma.liveSession.findUnique({
      where: { id },
      select: { hostId: true, status: true },
    });
    if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });
    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Sólo el host puede finalizar' });
    }
    if (session.status === 'ended') {
      return res.json({ ok: true }); // Idempotente
    }

    await endSession(id, userId);
    res.json({ ok: true });
  } catch (err) {
    if (err instanceof LiveSessionServiceError) {
      const status = err.code === 'NOT_FOUND' ? 404 : 403;
      return res.status(status).json({ error: err.message });
    }
    next(err);
  }
}
