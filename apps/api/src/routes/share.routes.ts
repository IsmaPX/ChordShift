/**
 * Rutas de SongShare.
 */

import { Router } from 'express';
import {
  createShare,
  listSharedWithMe,
  listMyShares,
  revokeShare,
} from '../controllers/share.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { createShareSchema, listSharedWithMeSchema } from '../validators/share.validator.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body } = createShareSchema.parse(req);
    req.body = body;
    await createShare(req, res);
  }),
);

router.get(
  '/received',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { query } = listSharedWithMeSchema.parse(req);
    Object.assign(req.query, query);
    await listSharedWithMe(req, res);
  }),
);

router.get('/sent', requireAuth, asyncHandler(listMyShares));

router.delete('/:shareId', requireAuth, asyncHandler(revokeShare));

export default router;
