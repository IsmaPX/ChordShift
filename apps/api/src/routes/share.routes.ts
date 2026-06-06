/**
 * Rutas de SongShare.
 */

import { Router, type Router as ExpressRouter } from 'express';
import {
  createShare,
  listSharedWithMe,
  listMyShares,
  revokeShare,
} from '../controllers/share.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { createShareSchema, listSharedWithMeSchema } from '../validators/share.validator.js';

const router: ExpressRouter = Router();

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

router.get('/sent', requireAuth, // eslint-disable-next-line @typescript-eslint/no-explicit-any
asyncHandler(listMyShares as any));

router.delete('/:shareId', requireAuth, // eslint-disable-next-line @typescript-eslint/no-explicit-any
asyncHandler(revokeShare as any));

export default router;
