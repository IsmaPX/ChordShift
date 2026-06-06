/**
 * Rutas de Settings: actualizar perfil del usuario.
 *
 * Las rutas son /api/users/:id/settings, /api/users/:id/xp, etc.
 */

import { Router } from 'express';
import {
  updateSettings,
  addXp,
  setPhoneNumber,
  clearPhoneNumber,
} from '../controllers/settings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import {
  updateSettingsSchema,
  addXpSchema,
  setPhoneSchema,
} from '../validators/settings.validator.js';

const router = Router();

router.patch(
  '/:id/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, params } = updateSettingsSchema.parse({ body: req.body, params: req.params });
    req.body = body;
    req.params.id = params.id;
    await updateSettings(req, res);
  }),
);

router.post(
  '/:id/xp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, params } = addXpSchema.parse({ body: req.body, params: req.params });
    req.body = body;
    req.params.id = params.id;
    await addXp(req, res);
  }),
);

router.put(
  '/:id/phone',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, params } = setPhoneSchema.parse({ body: req.body, params: req.params });
    req.body = body;
    req.params.id = params.id;
    await setPhoneNumber(req, res);
  }),
);

router.delete(
  '/:id/phone',
  requireAuth,
  asyncHandler(clearPhoneNumber),
);

export default router;
