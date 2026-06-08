/**
 * Rutas de Practice Sessions.
 */

import { Router, type Router as ExpressRouter } from 'express';
import { listSessions, createSession, getUserStats } from '../controllers/session.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { createSessionSchema } from '../validators/session.validator.js';

const router: ExpressRouter = Router();

router.get('/user/:userId', requireAuth,
asyncHandler(listSessions as any));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { body } = createSessionSchema.parse(req);
  req.body = body;
  await createSession(req as any, res);
}));

router.get('/stats/me', requireAuth,
asyncHandler(getUserStats as any));

export default router;
