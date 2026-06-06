/**
 * Rutas de Practice Sessions.
 */

import { Router } from 'express';
import { listSessions, createSession, getUserStats } from '../controllers/session.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { createSessionSchema } from '../validators/session.validator.js';

const router = Router();

router.get('/user/:userId', requireAuth, asyncHandler(listSessions));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { body } = createSessionSchema.parse(req);
  req.body = body;
  await createSession(req, res);
}));

router.get('/stats/me', requireAuth, asyncHandler(getUserStats));

export default router;
