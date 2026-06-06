/**
 * Controllers de audio: upload, download, delete.
 *
 * Usa multipart/form-data con busboy-style parsing via multer.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { storage } from '../services/storage.service.js';
import { AppError } from '../middleware/error.middleware.js';
import { audioMetadataSchema } from '../validators/audio.validator.js';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024; // 25 MB

export async function uploadAudio(req: Request<{ songId: string }>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  // Verificar que la canción existe y (si es del usuario) es suya
  const song = await prisma.song.findUnique({ where: { id: req.params.songId } });
  if (!song) throw new AppError(404, 'Canción no encontrada');
  if (song.createdById && song.createdById !== req.user.id) {
    throw new AppError(403, 'No tienes permiso para subir audio a esta canción');
  }

  if (!req.file) {
    throw new AppError(400, 'Archivo de audio requerido', 'NO_FILE');
  }
  if (req.file.size > MAX_AUDIO_BYTES) {
    throw new AppError(413, 'El archivo excede el tamaño máximo (25 MB)');
  }

  // Validar metadata
  const meta = audioMetadataSchema.parse({
    name: req.file.originalname,
    type: req.file.mimetype,
  });

  // Eliminar audio previo si existe
  const existing = await prisma.songAudio.findFirst({
    where: { songId: req.params.songId },
  });
  if (existing) {
    await storage.delete(existing.url.split('/').pop() ?? '');
    await prisma.songAudio.delete({ where: { id: existing.id } });
  }

  // Guardar
  const stored = await storage.save(req.file.buffer, meta.name, meta.type);

  const audio = await prisma.songAudio.create({
    data: {
      userId: req.user.id,
      songId: req.params.songId,
      url: stored.url,
      name: meta.name,
      size: stored.size,
      mimeType: meta.type,
    },
  });

  res.status(201).json({ audio });
}

export async function getAudio(req: Request<{ songId: string }>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const audio = await prisma.songAudio.findFirst({
    where: { songId: req.params.songId },
    orderBy: { createdAt: 'desc' },
  });

  if (!audio) {
    throw new AppError(404, 'Audio no encontrado');
  }

  res.json({ audio });
}

export async function deleteAudio(req: Request<{ songId: string }>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const audio = await prisma.songAudio.findFirst({
    where: { songId: req.params.songId },
  });
  if (!audio) throw new AppError(404, 'Audio no encontrado');
  if (audio.userId !== req.user.id) {
    throw new AppError(403, 'No autorizado');
  }

  const key = audio.url.split('/').pop() ?? '';
  await storage.delete(key);
  await prisma.songAudio.delete({ where: { id: audio.id } });

  res.status(204).send();
}
