/**
 * Rutas de Leaderboard.
 */

import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { leaderboardQuerySchema } from '../validators/leaderboard.validator.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { query } = leaderboardQuerySchema.parse(req);
    Object.assign(req.query, query);
    await getLeaderboard(req, res);
  }),
);

export default router;
