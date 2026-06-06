/**
 * Controllers de Auth: register, login, me, updateProfile.
 */

import type { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword } from '../services/password.service.js';
import { signToken } from '../services/token.service.js';
import { AppError } from '../middleware/error.middleware.js';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '../validators/auth.validator.js';

const DEFAULT_SETTINGS = {
  tempo_bpm: 120,
  language: 'es',
  notifications_enabled: true,
  feedback_concept: 'rings',
  xp: 0,
  preferred_instrument: 'piano',
  metronome_enabled: true,
  metronome_volume: 0.5,
  difficulty: 1,
  pin_enabled: false,
  phone_number: '',
  phone_verified: false,
  reminder_time: '18:00',
  reminder_days: [1, 3, 5],
  last_reminder_sent: '',
};

export async function register(req: Request<{}, {}, RegisterInput>, res: Response) {
  const { email, password, displayName, pin } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError(409, 'El email ya está registrado', 'EMAIL_TAKEN');
  }

  const passwordHash = await hashPassword(password);
  const pinHash = pin ? await hashPassword(pin) : null;

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName: displayName ?? null,
      pinHash,
      settings: DEFAULT_SETTINGS,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      createdAt: true,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ user, token });
}

export async function login(req: Request<{}, {}, LoginInput>, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastActiveAt: new Date() },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt,
    },
    token,
  });
}

export async function me(req: Request, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      settings: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });
  if (!user) throw new AppError(404, 'Usuario no encontrado');
  res.json({ user });
}

export async function updateProfile(req: Request<{}, {}, UpdateProfileInput>, res: Response) {
  if (!req.user) throw new AppError(401, 'No autenticado');
  const { displayName, pin } = req.body;

  const data: Record<string, unknown> = {};
  if (displayName !== undefined) data.displayName = displayName;
  if (pin !== undefined) {
    data.pinHash = pin ? await hashPassword(pin) : null;
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  });

  res.json({ user });
}
