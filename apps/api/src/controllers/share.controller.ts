/**
 * Controllers de SongShare: compartir canciones con otros usuarios.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import { sendToUser } from '../services/pushNotification.service.js';
import type {
  CreateShareInput,
  ListSharedWithMeQuery,
} from '../validators/share.validator.js';

export async function createShare(req: Request<{}, {}, CreateShareInput>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  // Verificar ownership de la canción
  const song = await prisma.song.findUnique({ where: { id: req.body.songId } });
  if (!song) throw new AppError(404, 'Canción no encontrada');
  if (song.createdById !== req.user.id) {
    throw new AppError(403, 'Solo puedes compartir canciones tuyas');
  }

  // Resolver email a userId
  const target = await prisma.user.findUnique({
    where: { email: req.body.sharedWithEmail },
    select: { id: true },
  });
  if (!target) throw new AppError(404, 'Usuario destinatario no encontrado');
  if (target.id === req.user.id) {
    throw new AppError(400, 'No puedes compartir contigo mismo');
  }

  const share = await prisma.songShare.upsert({
    where: {
      songId_sharedWithId: {
        songId: req.body.songId,
        sharedWithId: target.id,
      },
    },
    update: { permission: req.body.permission },
    create: {
      songId: req.body.songId,
      sharedById: req.user.id,
      sharedWithId: target.id,
      permission: req.body.permission,
    },
    include: {
      song: { select: { id: true, title: true, artist: true } },
      sharedBy: { select: { id: true, displayName: true } },
    },
  });

  res.status(201).json({ share });

  // Notificar al destinatario (best-effort, fire & forget)
  void sendToUser(target.id, {
    title: `${req.user.displayName ?? req.user.email} compartió una canción contigo`,
    body: `"${share.song.title}"`,
    tag: `share:${share.id}`,
    url: '/shared',
    data: { shareId: share.id, songId: share.song.id },
  }).catch(() => {
    // Silenciar — la share se creó OK aunque la push falle
  });
}

export async function listSharedWithMe(
  req: Request<{}, {}, {}, ListSharedWithMeQuery>,
  res: Response,
) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const shares = await prisma.songShare.findMany({
    where: {
      sharedWithId: req.user.id,
      ...(req.query.permission && { permission: req.query.permission }),
    },
    include: {
      song: true,
      sharedBy: { select: { id: true, displayName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ shares });
}

export async function listMyShares(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const shares = await prisma.songShare.findMany({
    where: { sharedById: req.user.id },
    include: {
      song: { select: { id: true, title: true, artist: true } },
      sharedWith: { select: { id: true, displayName: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ shares });
}

export async function revokeShare(req: Request<{ shareId: string }>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');

  const share = await prisma.songShare.findUnique({ where: { id: req.params.shareId } });
  if (!share) throw new AppError(404, 'Share no encontrado');
  if (share.sharedById !== req.user.id) {
    throw new AppError(403, 'No autorizado');
  }

  await prisma.songShare.delete({ where: { id: share.id } });
  res.status(204).send();
}
