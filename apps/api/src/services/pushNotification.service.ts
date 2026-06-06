/**
 * Servicio de notificaciones push (Web Push API).
 *
 * Usa `web-push` para enviar pushes a navegadores. Las suscripciones
 * se almacenan en la tabla `push_subscriptions`.
 *
 * VAPID:
 * - Generar claves: `npx web-push generate-vapid-keys`
 * - VAPID_PUBLIC_KEY se envía al cliente (en /.well-known o en /api/config)
 * - VAPID_PRIVATE_KEY sólo en el server
 *
 * Si las claves VAPID no están configuradas, el servicio funciona
 * en "dry-run" (sólo loguea, no envía).
 */

import webpush from 'web-push';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

let vapidConfigured = false;

/** Lee VAPID_PUBLIC_KEY priorizando process.env (test-friendly) y fallback a env validado. */
function readVapidPublicKey(): string | undefined {
  return process.env.VAPID_PUBLIC_KEY || env.VAPID_PUBLIC_KEY;
}

/** Lee VAPID_PRIVATE_KEY priorizando process.env. */
function readVapidPrivateKey(): string | undefined {
  return process.env.VAPID_PRIVATE_KEY || env.VAPID_PRIVATE_KEY;
}

function ensureVapidConfigured(): boolean {
  const publicKey = readVapidPublicKey();
  const privateKey = readVapidPrivateKey();
  if (!publicKey || !privateKey) {
    return false;
  }
  // Re-configurar cada vez (permite reconfiguración en tests/runtime)
  webpush.setVapidDetails(
    env.VAPID_SUBJECT,
    publicKey,
    privateKey,
  );
  vapidConfigured = true;
  return true;
}

export type PushPayload = {
  title: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  /** URL a abrir al hacer click. */
  url?: string;
  /** Si true, requiere interacción del usuario. */
  requireInteraction?: boolean;
};

/**
 * Registra una nueva suscripción push para un usuario.
 * Si ya existe (mismo endpoint), actualiza la asociación.
 */
export async function subscribe(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent?: string,
): Promise<{ id: string }> {
  const result = await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent,
    },
    update: {
      userId, // Re-asociar (útil si el usuario cambió)
      userAgent,
    },
    select: { id: true },
  });
  return result;
}

/**
 * Elimina una suscripción (logout o unsubscribe del browser).
 */
export async function unsubscribe(endpoint: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}

/**
 * Envía una notificación a todas las suscripciones de un usuario.
 *
 * Maneja automáticamente suscripciones expiradas (410 Gone) eliminándolas.
 * Si VAPID no está configurado, sólo loguea (modo dry-run).
 */
export async function sendToUser(
  userId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number; skipped: boolean }> {
  if (!ensureVapidConfigured()) {
    // eslint-disable-next-line no-console
    console.log('[push] VAPID not configured, dry-run:', { userId, payload });
    return { sent: 0, failed: 0, skipped: true };
  }

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) {
    return { sent: 0, failed: 0, skipped: false };
  }

  let sent = 0;
  let failed = 0;
  const expired: string[] = [];

  await Promise.all(
    subs.map(async sub => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ ...payload, data: { ...payload.data, url: payload.url } }),
          { TTL: 60 * 60 * 24 }, // 24h
        );
        sent++;
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { lastUsedAt: new Date() },
        });
      } catch (err: unknown) {
        failed++;
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expired.push(sub.id);
        }
      }
    }),
  );

  if (expired.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { id: { in: expired } },
    });
  }

  return { sent, failed, skipped: false };
}

/**
 * Devuelve la clave VAPID pública. El cliente la usa para suscribirse.
 * Si no está configurada, devuelve null (push deshabilitado).
 */
export function getPublicVapidKey(): string | null {
  return readVapidPublicKey() ?? null;
}

/** Sólo para tests. */
export function __resetForTests(): void {
  vapidConfigured = false;
}
