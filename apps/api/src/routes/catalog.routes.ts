/**
 * Catálogo público: estilos y tips.
 * Estos endpoints son de solo lectura para todos los usuarios.
 */

import { Router } from 'express';
import { prisma } from '../config/database.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

router.get('/styles', asyncHandler(async (_req, res) => {
  const styles = await prisma.style.findMany({
    orderBy: { difficulty: 'asc' },
  });
  res.json({ styles });
}));

router.get('/tips', asyncHandler(async (req, res) => {
  const { category, styleId, difficultyMin } = req.query;
  const where: Record<string, unknown> = {};
  if (category && typeof category === 'string') where.category = category;
  if (styleId && typeof styleId === 'string') where.styleId = styleId;
  if (difficultyMin) where.difficultyMin = { lte: Number(difficultyMin) };

  const tips = await prisma.tip.findMany({
    where,
    take: 50,
    orderBy: { difficultyMin: 'asc' },
  });
  res.json({ tips });
}));

export default router;
