/**
 * Controllers de sync: batch processing y snapshot.
 */

import type { Request, Response } from 'express';
import { processSyncBatch } from '../services/sync.service.js';
import { getUserSnapshot } from '../services/snapshot.service.js';
import { AppError } from '../middleware/error.middleware.js';
import type { SyncBatchInput } from '../validators/sync.validator.js';

/**
 * POST /api/sync/batch
 * Procesa un batch de operaciones acumuladas offline.
 */
export async function syncBatch(
  req: Request<{}, {}, SyncBatchInput>,
  res: Response,
) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const result = await processSyncBatch(req.user.id, req.body.operations);

  res.json(result);
}

/**
 * GET /api/sync/snapshot
 * Devuelve el estado completo del usuario para hidratación inicial.
 * Optimizado para serializar eficientemente (sin includes anidados profundos).
 */
export async function getSnapshot(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const snapshot = await getUserSnapshot(req.user.id);
  res.json(snapshot);
}

/**
 * GET /api/sync/status
 * Estado del servidor para que el cliente pueda saber su versión de snapshot.
 */
export async function getSyncStatus(_req: Request, res: Response) {
  res.json({
    serverTime: new Date().toISOString(),
    minSupportedClientVersion: '1.0.0',
  });
}
