/**
 * Rutas de Songs.
 */

import { Router, type Router as ExpressRouter } from 'express';
import {
  listSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
} from '../controllers/song.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { createSongSchema, updateSongSchema, listSongsSchema } from '../validators/song.validator.js';

const router: ExpressRouter = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { query } = listSongsSchema.parse(req);
  Object.assign(req.query, query);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await listSongs(req as any, res);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await getSong(req as any, res);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { body } = createSongSchema.parse(req);
  req.body = body;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await createSong(req as any, res);
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { body, params } = updateSongSchema.parse({ body: req.body, params: req.params });
  req.body = body;
  req.params.id = params.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await updateSong(req as any, res);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await deleteSong(req as any, res);
}));

export default router;
