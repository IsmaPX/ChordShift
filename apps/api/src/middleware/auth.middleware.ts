/**
 * Middleware de autenticación.
 * Verifica el header `Authorization: Bearer <token>` y adjunta el usuario al request.
 */

import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../services/token.service.js';
import { prisma } from '../config/database.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        displayName?: string | null;
      };
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = header.slice(7);
    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (err) {
    next(err);
  }
}
