/**
 * Rutas de audio: upload, download (stream), metadata.
 */

import { Router, type Router as ExpressRouter } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { storage } from '../services/storage.service.js';
import { uploadAudio, getAudio, deleteAudio } from '../controllers/audio.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { env } from '../config/env.js';

const router: ExpressRouter = Router();

// Multer con almacenamiento en memoria (los archivos van directo a storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/ogg', 'audio/webm', 'audio/mp4'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

router.post(
  '/songs/:songId/audio',
  requireAuth,
  upload.single('audio'),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asyncHandler(uploadAudio as any),
);

router.get(
  '/songs/:songId/audio',
  requireAuth,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asyncHandler(getAudio as any),
);

router.delete(
  '/songs/:songId/audio',
  requireAuth,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  asyncHandler(deleteAudio as any),
);

/**
 * Stream de archivos (endpoint público — los assets son propiedad del usuario
 * pero no requieren auth para servir como estáticos).
 * En producción, idealmente firmar URLs con expiración (S3 presigned).
 */
router.get('/storage/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  if (!key || key.includes('..')) {
    return res.status(400).json({ error: 'Key inválida' });
  }
  if (!(await storage.exists(key))) {
    return res.status(404).json({ error: 'Archivo no encontrado' });
  }

  const buffer = await storage.read(key);
  const ext = path.extname(key).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.webm': 'audio/webm',
    '.m4a': 'audio/mp4',
  };
  res.setHeader('Content-Type', mimeMap[ext] ?? 'application/octet-stream');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(buffer);
}));

void env; // Mantener import para tree-shaking awareness en el bundler
void crypto;

export default router;
