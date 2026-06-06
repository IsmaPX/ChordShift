/**
 * Rutas de Sync: batch processing, snapshot, status.
 */

import { Router } from 'express';
import { syncBatch, getSnapshot, getSyncStatus } from '../controllers/sync.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { syncBatchSchema } from '../validators/sync.validator.js';

const router = Router();

router.get('/status', asyncHandler(getSyncStatus));

router.get(
  '/snapshot',
  requireAuth,
  asyncHandler(getSnapshot),
);

router.post(
  '/batch',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body } = syncBatchSchema.parse(req);
    req.body = body;
    await syncBatch(req, res);
  }),
);

export default router;
