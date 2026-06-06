/**
 * Rutas REST para sesiones en vivo.
 *
 * La lógica fina de pause/resume/beat va por Socket.IO. REST se usa
 * para crear y finalizar (operaciones menos frecuentes).
 */

import { Router, type Router as ExpressRouter } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  postLiveSession,
  getMyActiveSessions,
  getLiveSession,
  postEndLiveSession,
} from '../controllers/liveSession.controller.js';

const router: ExpressRouter = Router();

router.post('/', requireAuth, postLiveSession);
router.get('/', requireAuth, getMyActiveSessions);
router.get('/:id', requireAuth, getLiveSession);
router.post('/:id/end', requireAuth, postEndLiveSession);

export default router;
