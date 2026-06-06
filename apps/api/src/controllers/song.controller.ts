/**
 * Controllers de Songs.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateSongInput, UpdateSongInput, ListSongsQuery } from '../validators/song.validator.js';

export async function listSongs(req: Request<{}, {}, {}, ListSongsQuery>, res: Response) {
  const { search, styleId, tab = 'all', limit = 20, offset = 0 } = req.query;
  const userId = req.user?.id;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (tab === 'preset') {
    where.isPreset = true;
  } else if (tab === 'mine' && userId) {
    where.createdById = userId;
  } else {
    where.OR = [{ isPreset: true }];
    if (userId) where.OR.push({ createdById: userId });
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }
  if (styleId) {
    where.styleId = styleId;
  }

  const [songs, total] = await Promise.all([
    prisma.song.findMany({
      where,
      include: { style: { select: { name: true, difficulty: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.song.count({ where }),
  ]);

  res.json({ songs, total, limit, offset });
}

export async function getSong(req: Request<{ id: string }>, res: Response) {
  const song = await prisma.song.findUnique({
    where: { id: req.params.id },
    include: { style: true, createdBy: { select: { id: true, displayName: true } } },
  });
  if (!song) throw new AppError(404, 'Canción no encontrada');
  res.json({ song });
}

export async function createSong(req: Request<{}, {}, CreateSongInput>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const song = await prisma.song.create({
    data: {
      ...req.body,
      createdById: req.user.id,
      isPreset: false,
    },
  });
  res.status(201).json({ song });
}

export async function updateSong(req: Request<{ id: string }, {}, UpdateSongInput>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const existing = await prisma.song.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, 'Canción no encontrada');
  if (existing.createdById !== req.user.id) {
    throw new AppError(403, 'No tienes permiso para editar esta canción');
  }

  const song = await prisma.song.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ song });
}

export async function deleteSong(req: Request<{ id: string }>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const existing = await prisma.song.findUnique({ where: { id: req.params.id } });
  if (!existing) throw new AppError(404, 'Canción no encontrada');
  if (existing.createdById !== req.user.id) {
    throw new AppError(403, 'No tienes permiso para eliminar esta canción');
  }

  await prisma.song.delete({ where: { id: req.params.id } });
  res.status(204).send();
}
