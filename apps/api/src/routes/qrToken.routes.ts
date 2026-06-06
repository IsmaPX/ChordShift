/**
 * Rutas para tokens QR (guest join a live sessions).
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { postSessionQr, postRedeemQr } from '../controllers/qrToken.controller.js';

const router = Router();

// El host genera un QR (autenticado)
router.post('/live-sessions/:id/qr', requireAuth, postSessionQr);
// El guest canjea el QR (NO autenticado — es el punto de entrada)
router.post('/qr/redeem', postRedeemQr);

export default router;
