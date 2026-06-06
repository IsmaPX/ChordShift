/**
 * Controllers de Settings: actualizar perfil, XP, settings, teléfono.
 *
 * Cada usuario solo puede modificar su propio perfil.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../middleware/error.middleware.js';
import type {
  UpdateSettingsInput,
  AddXpInput,
  SetPhoneInput,
} from '../validators/settings.validator.js';

async function ensureSelfAccess(req: Request<{ id: string }>) {
  if (!req.user) throw new AppError(401, 'No autenticado');
  if (req.user.id !== req.params.id) {
    throw new AppError(403, 'No autorizado a modificar otro usuario');
  }
}

export async function updateSettings(
  req: Request<{ id: string }, {}, UpdateSettingsInput>,
  res: Response,
) {
  await ensureSelfAccess(req);

  const current = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { settings: true },
  });
  if (!current) throw new AppError(404, 'Usuario no encontrado');

  const merged = { ...(current.settings as Record<string, unknown>), ...req.body };

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { settings: merged },
    select: { id: true, email: true, displayName: true, settings: true },
  });

  res.json({ user });
}

export async function addXp(req: Request<{ id: string }, {}, AddXpInput>, res: Response) {
  await ensureSelfAccess(req);

  const current = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { settings: true },
  });
  if (!current) throw new AppError(404, 'Usuario no encontrado');

  const settings = current.settings as Record<string, unknown>;
  const currentXp = typeof settings.xp === 'number' ? settings.xp : 0;
  const newXp = currentXp + req.body.xp;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { settings: { ...settings, xp: newXp } },
    select: { id: true, settings: true },
  });

  res.json({ xp: newXp, user });
}

export async function setPhoneNumber(
  req: Request<{ id: string }, {}, SetPhoneInput>,
  res: Response,
) {
  await ensureSelfAccess(req);

  const current = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { settings: true },
  });
  if (!current) throw new AppError(404, 'Usuario no encontrado');

  const settings = current.settings as Record<string, unknown>;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      settings: {
        ...settings,
        phone_number: req.body.phone,
        phone_verified: req.body.verified,
      },
    },
    select: { id: true, settings: true },
  });

  res.json({ user });
}

export async function clearPhoneNumber(req: Request<{ id: string }>, res: Response) {
  await ensureSelfAccess(req);

  const current = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { settings: true },
  });
  if (!current) throw new AppError(404, 'Usuario no encontrado');

  const settings = current.settings as Record<string, unknown>;
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      settings: { ...settings, phone_number: '', phone_verified: false },
    },
    select: { id: true, settings: true },
  });

  res.json({ user });
}
