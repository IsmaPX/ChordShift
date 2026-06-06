/**
 * Rutas de Ear Training: crear resultados, listar, estadísticas.
 */

import { Router } from 'express';
import { createResult, listMyResults, getMyStats } from '../controllers/ear-training.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import {
  createEarTrainingResultSchema,
  listEarTrainingResultsSchema,
} from '../validators/ear-training.validator.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body } = createEarTrainingResultSchema.parse(req);
    req.body = body;
    await createResult(req, res);
  }),
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { query } = listEarTrainingResultsSchema.parse(req);
    Object.assign(req.query, query);
    await listMyResults(req, res);
  }),
);

router.get('/stats/me', requireAuth, asyncHandler(getMyStats));

export default router;
