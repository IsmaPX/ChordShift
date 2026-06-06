/**
 * Controller para Web Push subscriptions.
 *
 * - GET  /api/push/vapid-key       → clave pública
 * - POST /api/push/subscribe        → registrar suscripción
 * - POST /api/push/unsubscribe      → eliminar suscripción
 * - POST /api/push/test             → enviar push de prueba al usuario actual
 */

import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getPublicVapidKey,
  subscribe as subscribeService,
  unsubscribe as unsubscribeService,
  sendToUser,
} from '../services/pushNotification.service.js';

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export function getVapidKey(_req: Request, res: Response) {
  const key = getPublicVapidKey();
  res.json({ publicKey: key, enabled: key !== null });
}

export async function postSubscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const parsed = subscribeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    }
    const result = await subscribeService(
      userId,
      parsed.data,
      req.headers['user-agent'],
    );
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function postUnsubscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { endpoint } = req.body;
    if (typeof endpoint !== 'string') {
      return res.status(400).json({ error: 'endpoint requerido' });
    }
    await unsubscribeService(endpoint);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function postTestPush(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await sendToUser(userId, {
      title: '¡Worship Piano!',
      body: 'Esta es una notificación de prueba 🎹',
      tag: 'test',
      url: '/',
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
