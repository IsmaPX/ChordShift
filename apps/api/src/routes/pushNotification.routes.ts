/**
 * Rutas para Web Push subscriptions.
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  getVapidKey,
  postSubscribe,
  postUnsubscribe,
  postTestPush,
} from '../controllers/pushNotification.controller.js';

const router = Router();

// Público: clave VAPID
router.get('/vapid-key', getVapidKey);
// Resto requiere auth
router.post('/subscribe', requireAuth, postSubscribe);
router.post('/unsubscribe', requireAuth, postUnsubscribe);
router.post('/test', requireAuth, postTestPush);

export default router;
