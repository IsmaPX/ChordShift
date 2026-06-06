/**
 * Controller para tokens QR de live sessions.
 *
 * Endpoints:
 * - POST /api/live-sessions/:id/qr → host genera token QR
 * - POST /api/qr/redeem → guest canjea token y obtiene JWT temporal
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database.js';
import { qrTokenRegistry } from '../services/qrToken.service.js';
import { liveSessionRegistry } from '../sockets/liveSession.registry.js';

const redeemSchema = z.object({
  token: z.string().min(10, 'Token QR inválido'),
});

export async function postSessionQr(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'id requerido' });

    // Verificar que el usuario es el host
    const session = await prisma.liveSession.findUnique({
      where: { id },
      select: { hostId: true, status: true },
    });
    if (!session) return res.status(404).json({ error: 'Sesión no encontrada' });
    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Sólo el host puede generar un QR' });
    }
    if (session.status === 'ended') {
      return res.status(400).json({ error: 'La sesión ya terminó' });
    }

    // Verificar que la sesión está activa en el registry
    if (!liveSessionRegistry.exists(id)) {
      return res.status(400).json({ error: 'La sesión no está activa en memoria' });
    }

    const qr = qrTokenRegistry.create(id, userId);
    res.status(201).json(qr);
  } catch (err) {
    next(err);
  }
}

export async function postRedeemQr(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = redeemSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    }
    const result = qrTokenRegistry.redeem(parsed.data.token);
    if (!result.ok) {
      return res.status(400).json({ error: result.error });
    }

    // Verificar que la sesión sigue activa
    if (!liveSessionRegistry.exists(result.sessionId)) {
      return res.status(410).json({ error: 'La sesión ya no está activa' });
    }

    const guestToken = qrTokenRegistry.issueGuestToken(result.sessionId, result.hostId);
    res.json({
      guestToken,
      sessionId: result.sessionId,
      // Tiempo de expiración del JWT
      expiresInSeconds: 5 * 60,
    });
  } catch (err) {
    next(err);
  }
}
