/**
 * Configuración del servidor Socket.IO.
 *
 * Auth:
 * - El cliente debe pasar el JWT en `auth.token` al hacer handshake
 * - Verificamos el token y adjuntamos `socket.data.userId/email/displayName`
 *
 * Rooms:
 * - `session:<id>` — todos los participantes de una sesión en vivo
 * - `leaderboard:<category>:<period>` — suscriptores de updates de leaderboard
 *
 * Rate limiting:
 * - Socket.IO hereda el express-rate-limit si está detrás del mismo
 *   proceso. Para defensa adicional, limitamos eventos por socket.
 *
 * Reconexión:
 * - El cliente puede reconectar. La registry retiene el estado siempre
 *   que el TTL (SESSION_TTL_MS) no haya expirado.
 */

import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { env } from '../config/env.js';
import { verifyToken, type TokenPayload } from '../services/token.service.js';
import { prisma } from '../config/database.js';
import { liveSessionRegistry } from './liveSession.registry.js';
import {
  createSession,
  endSession,
  updateBeat,
  getSession,
  LiveSessionServiceError,
} from '../services/liveSession.service.js';
import {
  attachIoForLeaderboard,
  subscribeSocketToLeaderboard,
  unsubscribeSocketFromLeaderboard,
  broadcastLeaderboardUpdate,
} from '../services/leaderboardEmitter.service.js';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
  SocketUser,
  JoinResponse,
  AckResponse,
  LiveSessionStatePayload,
} from './socket.types.js';
import type { LeaderboardCategory, LeaderboardPeriod } from '@chordshift/db';

type AppIo = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

const LEADERBOARD_CATEGORIES: readonly LeaderboardCategory[] = [
  'total_minutes',
  'sessions_completed',
  'ear_training_accuracy',
] as const;

const LEADERBOARD_PERIODS: readonly LeaderboardPeriod[] = [
  'daily',
  'weekly',
  'monthly',
  'all_time',
] as const;

function isLeaderboardCategory(value: string): value is LeaderboardCategory {
  return (LEADERBOARD_CATEGORIES as readonly string[]).includes(value);
}

function isLeaderboardPeriod(value: string): value is LeaderboardPeriod {
  return (LEADERBOARD_PERIODS as readonly string[]).includes(value);
}

export function createSocketServer(httpServer: HttpServer): AppIo {
  const io: AppIo = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
      credentials: true,
    },
    // Mantener conexión persistente: 25s ping, 60s timeout (defaults razonables)
    pingInterval: 25_000,
    pingTimeout: 60_000,
    // Limitar tamaño de payload para evitar abuse
    maxHttpBufferSize: 100_000, // 100 KB
  });

  // Registrar referencia para el emisor de leaderboard
  attachIoForLeaderboard(io);

  // Middleware de auth
  io.use(async (socket, next) => {
    try {
      const tokenRaw = (socket.handshake.auth as { token?: unknown })?.token;
      const token = typeof tokenRaw === 'string' ? tokenRaw : undefined;
      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      let payload: TokenPayload;
      try {
        payload = verifyToken(token);
      } catch {
        return next(new Error('Token inválido o expirado'));
      }

      // Guest token: viene del QR. No tiene user real, sólo un hostId
      // de referencia. Aceptamos sin consultar la DB.
      const guestPayload = payload as TokenPayload & {
        guest?: boolean;
        liveSessionId?: string;
      };
      if (guestPayload.guest) {
        if (!guestPayload.liveSessionId) {
          return next(new Error('Guest token sin sessionId'));
        }
        socket.data.userId = `guest:${payload.userId}`;
        socket.data.email = payload.email;
        socket.data.displayName = 'Invitado';
        // Marcar el socket para auto-join en 'connection'
        (socket.data as SocketData & { autoJoinSessionId?: string }).autoJoinSessionId =
          guestPayload.liveSessionId;
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, displayName: true },
      });
      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.data.userId = user.id;
      socket.data.email = user.email;
      socket.data.displayName = user.displayName;
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error('Error de autenticación'));
    }
  });

  io.on('connection', async socket => {
    const user: SocketUser = {
      id: socket.data.userId,
      email: socket.data.email,
      displayName: socket.data.displayName,
    };

    // Auto-join si el socket viene de un guest token
    const autoJoinSessionId = (socket.data as SocketData & { autoJoinSessionId?: string })
      .autoJoinSessionId;
    if (autoJoinSessionId) {
      try {
        const state = liveSessionRegistry.get(autoJoinSessionId);
        if (state) {
          liveSessionRegistry.join(autoJoinSessionId, socket.id, user);
          await socket.join(`session:${autoJoinSessionId}`);
          socket.to(`session:${autoJoinSessionId}`).emit('session:participant-joined', {
            sessionId: autoJoinSessionId,
            user,
          });
          // Informar al guest del estado actual
          socket.emit('session:state', state);
        }
      } catch (err) {
        // Si falla el auto-join, no bloqueamos la conexión
        console.error('[socket] auto-join failed', err);
      }
    }

    // --- Sesiones en vivo ---

    socket.on('session:join', async (sessionId, ack: (r: JoinResponse) => void) => {
      try {
        // Asegurar que la sesión existe (reconstruir desde DB si hace falta)
        let state: LiveSessionStatePayload | undefined = liveSessionRegistry.get(sessionId);
        if (!state) {
          const recovered = await getSession(sessionId);
          state = recovered ?? undefined;
        }
        if (!state) {
          return ack({ ok: false, error: 'Sesión no encontrada' });
        }

        // El host ya está marcado como participante; nuevos sockets se unen
        const updated = liveSessionRegistry.join(sessionId, socket.id, user);
        if (!updated) {
          return ack({ ok: false, error: 'No se pudo unir a la sesión' });
        }

        await socket.join(`session:${sessionId}`);

        // Notificar a los demás
        socket.to(`session:${sessionId}`).emit('session:participant-joined', {
          sessionId,
          user,
        });

        ack({ ok: true, state: updated });
      } catch (err) {
        ack({
          ok: false,
          error: err instanceof Error ? err.message : 'Error al unirse',
        });
      }
    });

    socket.on('session:leave', sessionId => {
      liveSessionRegistry.leave(sessionId, socket.id);
      socket.to(`session:${sessionId}`).emit('session:participant-left', {
        sessionId,
        userId: user.id,
      });
      void socket.leave(`session:${sessionId}`);
    });

    socket.on('session:pause', async (sessionId, ack: (r: AckResponse) => void) => {
      const result = liveSessionRegistry.pause(sessionId, user.id);
      if (!result.ok) {
        return ack({ ok: false, error: result.error ?? 'No se pudo pausar' });
      }
      const state = liveSessionRegistry.get(sessionId);
      const payload = {
        sessionId,
        atBeat: state?.currentBeat ?? 0,
        atMs: Date.now(),
      };
      io.to(`session:${sessionId}`).emit('session:paused', payload);
      ack({ ok: true });
    });

    socket.on('session:resume', async (sessionId, ack: (r: AckResponse) => void) => {
      const result = liveSessionRegistry.resume(sessionId, user.id);
      if (!result.ok) {
        return ack({ ok: false, error: result.error ?? 'No se pudo reanudar' });
      }
      const state = liveSessionRegistry.get(sessionId);
      const payload = {
        sessionId,
        atBeat: state?.currentBeat ?? 0,
        atMs: Date.now(),
      };
      io.to(`session:${sessionId}`).emit('session:resumed', payload);
      ack({ ok: true });
    });

    socket.on('session:end', async (sessionId, ack: (r: AckResponse) => void) => {
      try {
        // Persistir el fin (best-effort; no bloqueamos el ack si falla)
        const endPromise = endSession(sessionId, user.id);
        // Ack primero para que el host sepa que se aceptó la orden
        ack({ ok: true });
        await endPromise;
        // Notificar a todos los participantes
        io.to(`session:${sessionId}`).emit('session:ended', {
          sessionId,
          endedAtMs: Date.now(),
        });
        // Forzar desconexión de todos los sockets en la room
        io.in(`session:${sessionId}`).disconnectSockets(true);
      } catch (err) {
        // El ack ya se envió, pero notificamos el error
        socket.emit('session:error', {
          message: err instanceof LiveSessionServiceError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Error al finalizar',
        });
      }
    });

    /**
     * El host envía su beat actual periódicamente. El server lo re-emite
     * a todos los participantes con timestamp para sincronización.
     * También permite detectar latencia/drift entre clientes.
     */
    socket.on('session:beat-report', async ({ sessionId, beat }) => {
      const state = liveSessionRegistry.get(sessionId);
      if (!state) return;
      if (state.hostId !== user.id) {
        socket.emit('session:error', { message: 'Sólo el host puede reportar beats' });
        return;
      }
      const payload = liveSessionRegistry.updateBeat(sessionId, beat);
      if (payload) {
        io.to(`session:${sessionId}`).emit('session:beat', payload);
        // Persistir (fire & forget)
        void updateBeat(sessionId, beat);
      }
    });

    // --- Leaderboard (subscripción a updates) ---

    socket.on('leaderboard:subscribe', async (params: { category: string; period: string }) => {
      if (!isLeaderboardCategory(params.category) || !isLeaderboardPeriod(params.period)) {
        socket.emit('session:error', { message: 'Categoría o periodo inválido' });
        return;
      }
      subscribeSocketToLeaderboard(socket.id, params.category, params.period, io);
    });

    socket.on('leaderboard:unsubscribe', async (params: { category: string; period: string }) => {
      if (!isLeaderboardCategory(params.category) || !isLeaderboardPeriod(params.period)) return;
      unsubscribeSocketFromLeaderboard(socket.id, params.category, params.period, io);
    });

    // --- Sistema ---

    socket.on('ping', ({ atMs }, ack) => {
      ack({ atMs });
    });

    // Limpieza al desconectar
    socket.on('disconnect', () => {
      // No purgamos participantes inmediatamente — pueden reconectar.
      // La registry los limpia cuando vence el TTL.
    });
  });

  return io;
}

/**
 * Helper exportado para que los controllers (REST) puedan disparar
 * updates de leaderboard tras cambios significativos.
 */
export async function notifyLeaderboardChanged(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  currentUserId: string,
): Promise<void> {
  await broadcastLeaderboardUpdate(category, period, currentUserId);
}

/**
 * Helper para tests: crear sesión directamente sin pasar por REST.
 */
export { createSession };

/**
 * Helper para tests: acceder al registry desde fuera.
 */
export { liveSessionRegistry };
