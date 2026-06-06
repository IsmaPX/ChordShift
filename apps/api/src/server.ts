/**
 * Server bootstrap.
 */

import { createServer } from 'node:http';
import app from './app.js';
import { env } from './config/env.js';
import { createSocketServer } from './sockets/socketServer.js';
import { recoverFromDatabase } from './services/liveSession.service.js';
import { startLeaderboardCacheJob } from './services/leaderboard.service.js';

const PORT = env.PORT;

const httpServer = createServer(app);
const io = createSocketServer(httpServer);

const server = httpServer.listen(PORT, async () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   CORS origin: ${env.CORS_ORIGIN}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Socket.IO: ws://localhost:${PORT}`);

  // Recovery de sesiones activas tras un restart
  // No bloqueamos el listen — si la DB está caída, el server sigue funcionando
  // y las sesiones nuevas se crearán normalmente.
  try {
    const recovered = await recoverFromDatabase();
    if (recovered > 0) {
      console.log(`   🔄 Recovered ${recovered} active live session(s) from database`);
    }
  } catch (err) {
    console.error('   ⚠️  Failed to recover live sessions:', err);
  }

  // Job de leaderboard cache: refresca cada 2.5 min
  startLeaderboardCacheJob();
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  io.close();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
