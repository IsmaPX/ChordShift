/**
 * Rutas de Songs.
 */

import { Router } from 'express';
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

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { query } = listSongsSchema.parse(req);
  Object.assign(req.query, query);
  await listSongs(req, res);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  await getSong(req, res);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { body } = createSongSchema.parse(req);
  req.body = body;
  await createSong(req, res);
}));

router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { body, params } = updateSongSchema.parse({ body: req.body, params: req.params });
  req.body = body;
  req.params.id = params.id;
  await updateSong(req, res);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  await deleteSong(req, res);
}));

export default router;
