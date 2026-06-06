/**
 * Rutas de autenticación: register, login, me, updateProfile.
 */

import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validator.js';

const router = Router();

/**
 * POST /api/auth/register
 * Crea cuenta nueva y devuelve token JWT.
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { body } = registerSchema.parse(req);
  req.body = body;
  await register(req, res);
}));

/**
 * POST /api/auth/login
 * Autentica con email/password y devuelve token JWT.
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { body } = loginSchema.parse(req);
  req.body = body;
  await login(req, res);
}));

/**
 * GET /api/auth/me
 * Devuelve el perfil del usuario autenticado.
 */
router.get('/me', requireAuth, asyncHandler(me));

/**
 * PATCH /api/auth/me
 * Actualiza displayName o PIN del usuario autenticado.
 */
router.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const { body } = updateProfileSchema.parse(req);
  req.body = body;
  await updateProfile(req, res);
}));

export default router;
