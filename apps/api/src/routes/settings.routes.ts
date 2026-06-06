/**
 * Rutas de Settings: actualizar perfil del usuario.
 *
 * Las rutas son /api/users/:id/settings, /api/users/:id/xp, etc.
 */

import { Router, type Router as ExpressRouter } from 'express';
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

const router: ExpressRouter = Router();

router.patch(
  '/:id/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, params } = updateSettingsSchema.parse({ body: req.body, params: req.params });
    req.body = body;
    req.params.id = params.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateSettings(req as any, res);
  }),
);

router.post(
  '/:id/xp',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, params } = addXpSchema.parse({ body: req.body, params: req.params });
    req.body = body;
    req.params.id = params.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await addXp(req as any, res);
  }),
);

router.put(
  '/:id/phone',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, params } = setPhoneSchema.parse({ body: req.body, params: req.params });
    req.body = body;
    req.params.id = params.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await setPhoneNumber(req as any, res);
  }),
);

router.delete(
  '/:id/phone',
  requireAuth,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asyncHandler(clearPhoneNumber as any),
);

export default router;
