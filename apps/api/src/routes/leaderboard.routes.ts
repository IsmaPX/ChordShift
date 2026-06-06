/**
 * Rutas de Leaderboard.
 */

import { Router, type Router as ExpressRouter } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { leaderboardQuerySchema } from '../validators/leaderboard.validator.js';

const router: ExpressRouter = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { query } = leaderboardQuerySchema.parse(req);
    Object.assign(req.query, query);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await getLeaderboard(req as any, res);
  }),
);

export default router;
