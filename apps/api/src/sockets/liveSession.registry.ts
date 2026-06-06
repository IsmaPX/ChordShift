/**
 * Registry en memoria de sesiones en vivo activas.
 *
 * Por qué en memoria y no en Prisma:
 * - Estado de presencia es muy volátil (conexiones, beats, pausas)
 * - Las queries a Prisma por cada beat añadirían latencia inaceptable
 * - Prisma.liveSession se usa como snapshot de auditoría
 * - TTL: si no hay actividad en SESSION_TTL_MS, se purga automáticamente
 *
 * Estructura:
 * - sessions: Map<sessionId, LiveSessionState> — estado actual
 * - sockets: Map<sessionId, Set<socketId>> — sockets conectados a la sesión
 * - timers: Map<sessionId, NodeJS.Timeout> — TTL para limpieza
 *
 * Lifecycle hooks:
 * - El registry emite eventos via `onLifecycle` para que el service
 *   pueda persistir cambios (endedAt en Prisma, etc) sin acoplar
 *   la registry a Prisma.
 */

import type { LiveSessionState, SocketUser, BeatPayload } from './socket.types.js';
import { env } from '../config/env.js';

type SessionInternal = LiveSessionState & {
  lastBeatAtMs: number;
  // Offset en ms entre el reloj del servidor y el último beat
  beatOffsetMs: number;
};

export type SessionLifecycleEvent =
  | { type: 'created'; sessionId: string }
  | { type: 'ended'; sessionId: string; reason: 'host' | 'ttl' };

export type LifecycleListener = (event: SessionLifecycleEvent) => void;

class LiveSessionRegistry {
  private readonly sessions = new Map<string, SessionInternal>();
  private readonly sockets = new Map<string, Set<string>>();
  private readonly timers = new Map<string, NodeJS.Timeout>();
  private readonly lifecycleListeners = new Set<LifecycleListener>();

  /**
   * Registra un listener para eventos de lifecycle.
   * Devuelve función de unsubscribe.
   */
  onLifecycle(listener: LifecycleListener): () => void {
    this.lifecycleListeners.add(listener);
    return () => this.lifecycleListeners.delete(listener);
  }

  private emitLifecycle(event: SessionLifecycleEvent): void {
    for (const l of this.lifecycleListeners) {
      try {
        l(event);
      } catch (err) {
        // No propagamos el error — el listener no debe romper el ciclo
        // de vida de una sesión. El error se loguea en consola.
        // eslint-disable-next-line no-console
        console.error('[liveSessionRegistry] listener error', err);
      }
    }
  }

  /**
   * Crea o reemplaza una sesión. Si ya existía, se conservan los sockets
   * conectados pero se actualiza el estado base (bpm, song, etc).
   */
  create(state: Omit<LiveSessionState, 'participants'>): LiveSessionState {
    const existing = this.sessions.get(state.sessionId);
    const session: SessionInternal = {
      ...state,
      participants: existing?.participants ?? [],
      lastBeatAtMs: Date.now(),
      beatOffsetMs: 0,
    };
    this.sessions.set(state.sessionId, session);
    this.resetTtl(state.sessionId);
    this.emitLifecycle({ type: 'created', sessionId: state.sessionId });
    return this.toPublic(session);
  }

  get(sessionId: string): LiveSessionState | undefined {
    const s = this.sessions.get(sessionId);
    return s ? this.toPublic(s) : undefined;
  }

  exists(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }

  /**
   * Devuelve todas las sesiones activas. Útil para:
   * - Debug
   * - Recovery tras restart
   */
  list(): LiveSessionState[] {
    return Array.from(this.sessions.values()).map(s => this.toPublic(s));
  }

  /**
   * Registra un socket como participante. Devuelve la lista actualizada.
   */
  join(sessionId: string, socketId: string, user: SocketUser): LiveSessionState | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    // Añadir participante si no estaba
    if (!session.participants.some(p => p.id === user.id)) {
      session.participants.push(user);
    }

    if (!this.sockets.has(sessionId)) {
      this.sockets.set(sessionId, new Set());
    }
    this.sockets.get(sessionId)!.add(socketId);

    this.resetTtl(sessionId);
    return this.toPublic(session);
  }

  /**
   * Desregistra un socket. Si ya no quedan sockets, NO se borra la sesión
   * (puede reconectarse). Sólo se purga por TTL.
   */
  leave(sessionId: string, socketId: string): { userId: string | null } {
    const sockets = this.sockets.get(sessionId);
    if (sockets) {
      sockets.delete(socketId);
    }
    const session = this.sessions.get(sessionId);
    if (!session) return { userId: null };

    // No quitamos al participante del array — se mantienen en "ghost"
    // hasta que la sesión termine. Útil para reconexiones rápidas.
    return { userId: null };
  }

  /**
   * Actualiza el beat actual. Llamado por el host.
   */
  updateBeat(sessionId: string, beat: number): BeatPayload | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;
    session.currentBeat = beat;
    session.lastBeatAtMs = Date.now();
    this.resetTtl(sessionId);
    return {
      sessionId,
      beat,
      emittedAtMs: session.lastBeatAtMs,
    };
  }

  pause(sessionId: string, byUserId: string): { ok: boolean; error?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, error: 'Sesión no encontrada' };
    if (session.hostId !== byUserId) return { ok: false, error: 'Sólo el host puede pausar' };
    session.status = 'paused';
    this.resetTtl(sessionId);
    return { ok: true };
  }

  resume(sessionId: string, byUserId: string): { ok: boolean; error?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, error: 'Sesión no encontrada' };
    if (session.hostId !== byUserId) return { ok: false, error: 'Sólo el host puede reanudar' };
    session.status = 'active';
    session.lastBeatAtMs = Date.now();
    this.resetTtl(sessionId);
    return { ok: true };
  }

  end(sessionId: string, byUserId: string): { ok: boolean; error?: string } {
    const session = this.sessions.get(sessionId);
    if (!session) return { ok: false, error: 'Sesión no encontrada' };
    if (session.hostId !== byUserId) return { ok: false, error: 'Sólo el host puede finalizar' };
    this.purge(sessionId, 'host');
    return { ok: true };
  }

  /**
   * Limpia la sesión por TTL o por host.
   */
  private purge(sessionId: string, reason: 'host' | 'ttl'): void {
    const existed = this.sessions.delete(sessionId);
    this.sockets.delete(sessionId);
    const timer = this.timers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(sessionId);
    }
    if (existed) {
      this.emitLifecycle({ type: 'ended', sessionId, reason });
    }
  }

  private resetTtl(sessionId: string): void {
    const existing = this.timers.get(sessionId);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session) {
        // Auto-end por inactividad
        this.purge(sessionId, 'ttl');
      }
    }, env.SESSION_TTL_MS);
    this.timers.set(sessionId, timer);
  }

  private toPublic(s: SessionInternal): LiveSessionState {
    return {
      sessionId: s.sessionId,
      hostId: s.hostId,
      songId: s.songId,
      status: s.status,
      currentBeat: s.currentBeat,
      bpm: s.bpm,
      startedAtMs: s.startedAtMs,
      participants: [...s.participants],
    };
  }

  /**
   * Sólo para tests: resetear el registry.
   */
  __resetForTests(): void {
    for (const t of this.timers.values()) clearTimeout(t);
    this.sessions.clear();
    this.sockets.clear();
    this.timers.clear();
    this.lifecycleListeners.clear();
  }
}

export const liveSessionRegistry = new LiveSessionRegistry();
