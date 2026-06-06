/**
 * Punto de entrada de la aplicación Express.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import songRoutes from './routes/song.routes.js';
import sessionRoutes from './routes/session.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import audioRoutes from './routes/audio.routes.js';
import earTrainingRoutes from './routes/ear-training.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import shareRoutes from './routes/share.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';
import syncRoutes from './routes/sync.routes.js';
import liveSessionRoutes from './routes/liveSession.routes.js';
import qrTokenRoutes from './routes/qrToken.routes.js';
import pushNotificationRoutes from './routes/pushNotification.routes.js';
import './types/express.d.js';

const app: express.Express = express();

// Seguridad
app.use(helmet({
  // Necesario para servir archivos de audio (cross-origin)
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api', audioRoutes); // /api/songs/:songId/audio y /api/storage/:key
app.use('/api/ear-training', earTrainingRoutes);
app.use('/api/users', settingsRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/live-sessions', liveSessionRoutes);
app.use('/api', qrTokenRoutes); // /api/live-sessions/:id/qr y /api/qr/redeem
app.use('/api/push', pushNotificationRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler (debe ir al final)
app.use(errorHandler);

export default app;
