/**
 * Cliente Socket.IO para la app web.
 *
 * Responsabilidades:
 * - Mantener UNA conexión persistente al backend.
 * - Reconectar automáticamente con backoff exponencial.
 * - Exponer API tipada para emitir/recibir eventos.
 * - Si no hay token o la red está caída, **NO** conectar.
 *   Los hooks deben manejar la ausencia de conexión gracefully.
 *
 * Decisiones:
 * - Singleton: sólo una instancia por app (puede haber varios tabs,
 *   cada uno con su propia conexión, pero un tab no abre más de una).
 * - Token reactivo: si el token cambia (login/logout), se reinicia la
 *   conexión automáticamente.
 * - Reconexión: 1s, 2s, 5s, 10s, 30s, 60s, máx 5 min. Se resetea al
 *   recibir cualquier evento del servidor.
 */

import { io, type Socket } from 'socket.io-client';
import { tokenStore } from '../api/tokenStore';
import { API_BASE_URL } from '../api/client';
import type {
  ServerEventHandlers,
  LiveSessionState,
  AckResponse,
  JoinResponse,
  BeatPayload,
  PausePayload,
  ResumePayload,
  EndPayload,
  LeaderboardCategory,
  LeaderboardPeriod,
} from './socket.types';

type EventName = keyof ServerEventHandlers;

type QueuedCommand = {
  event: string;
  args: unknown[];
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000, 60_000, 300_000];

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';

export type SocketClientOptions = {
  /** Desactivar conexión automática (útil para tests). */
  autoConnect?: boolean;
  /** URL del backend. Default: API_BASE_URL del env. */
  url?: string;
  /** Logger opcional (default: console). */
  logger?: Pick<Console, 'log' | 'warn' | 'error'>;
};

export type SocketClient = {
  connect(): void;
  disconnect(): void;
  isConnected(): boolean;
  getStatus(): ConnectionStatus;
  on<K extends EventName>(event: K, handler: ServerEventHandlers[K]): () => void;
  off<K extends EventName>(event: K, handler: ServerEventHandlers[K]): void;
  joinSession(sessionId: string): Promise<JoinResponse>;
  leaveSession(sessionId: string): void;
  pauseSession(sessionId: string): Promise<AckResponse>;
  resumeSession(sessionId: string): Promise<AckResponse>;
  endSession(sessionId: string): Promise<AckResponse>;
  reportBeat(sessionId: string, beat: number): void;
  subscribeLeaderboard(category: LeaderboardCategory, period: LeaderboardPeriod): void;
  unsubscribeLeaderboard(category: LeaderboardCategory, period: LeaderboardPeriod): void;
};

class SocketClientImpl implements SocketClient {
  private socket: Socket | null = null;
  private status: ConnectionStatus = 'idle';
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private currentToken: string | null = null;
  private readonly handlers = new Map<EventName, Set<ServerEventHandlers[EventName]>>();
  private readonly commandQueue: QueuedCommand[] = [];
  private readonly listeners = new Set<(s: ConnectionStatus) => void>();
  private readonly options: Required<SocketClientOptions>;

  constructor(options: SocketClientOptions = {}) {
    this.options = {
      autoConnect: options.autoConnect ?? true,
      url: options.url ?? API_BASE_URL,
      logger: options.logger ?? console,
    };
    if (this.options.autoConnect) {
      this.connect();
    }
  }

  // ------------------------------------------------------------
  // Connection lifecycle
  // ------------------------------------------------------------

  connect(): void {
    if (this.socket?.connected) return;
    if (this.status === 'connecting') return;

    const token = tokenStore.getToken();
    if (!token) {
      // Sin token no tiene sentido conectar; los hooks deben llamar
      // explícitamente a connect() cuando el usuario hace login.
      this.setStatus('idle');
      return;
    }

    // Si cambió el token, recrear el socket
    if (this.currentToken && this.currentToken !== token && this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = token;

    this.setStatus('connecting');

    this.socket = io(this.options.url, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: false, // Manejamos la reconexión manualmente
      autoConnect: true,
      timeout: 10_000,
    });

    this.socket.on('connect', () => {
      this.reconnectAttempts = 0;
      this.setStatus('connected');
      this.flushQueue();
    });

    this.socket.on('disconnect', reason => {
      this.options.logger.warn?.(`[socket] disconnect: ${reason}`);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    });

    this.socket.on('connect_error', err => {
      this.options.logger.warn?.(`[socket] connect_error: ${err.message}`);
      this.setStatus('error');
      this.scheduleReconnect();
    });

    this.socket.on('error', err => {
      this.options.logger.error?.('[socket] error', err);
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
    this.setStatus('idle');
  }

  isConnected(): boolean {
    return this.status === 'connected';
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  /** Suscribe a cambios de estado. Retorna función de cleanup. */
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(handler);
    // Emitir estado actual inmediatamente
    queueMicrotask(() => handler(this.status));
    return () => {
      this.listeners.delete(handler);
    };
  }

  // ------------------------------------------------------------
  // Event handlers
  // ------------------------------------------------------------

  on<K extends EventName>(event: K, handler: ServerEventHandlers[K]): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as ServerEventHandlers[EventName]);

    // Asegurar que el socket tiene el listener montado
    this.socket?.on(event, (...args: unknown[]) => {
      // Resetear backoff en cualquier mensaje del servidor
      this.reconnectAttempts = 0;
      const set = this.handlers.get(event);
      if (!set) return;
      for (const h of set) {
        try {
          (h as (...a: unknown[]) => void)(...args);
        } catch (err) {
          this.options.logger.error?.(`[socket] handler error for ${event}`, err);
        }
      }
    });

    return () => this.off(event, handler);
  }

  off<K extends EventName>(event: K, handler: ServerEventHandlers[K]): void {
    this.handlers.get(event)?.delete(handler as ServerEventHandlers[EventName]);
    // No removemos del socket — los handlers ya no se llaman porque
    // el Set no contiene la referencia.
  }

  // ------------------------------------------------------------
  // Outbound commands
  // ------------------------------------------------------------

  joinSession(sessionId: string): Promise<JoinResponse> {
    return this.emitWithAck<JoinResponse>('session:join', sessionId);
  }

  leaveSession(sessionId: string): void {
    this.emitNow('session:leave', sessionId);
  }

  pauseSession(sessionId: string): Promise<AckResponse> {
    return this.emitWithAck<AckResponse>('session:pause', sessionId);
  }

  resumeSession(sessionId: string): Promise<AckResponse> {
    return this.emitWithAck<AckResponse>('session:resume', sessionId);
  }

  endSession(sessionId: string): Promise<AckResponse> {
    return this.emitWithAck<AckResponse>('session:end', sessionId);
  }

  reportBeat(sessionId: string, beat: number): void {
    this.emitNow('session:beat-report', { sessionId, beat });
  }

  subscribeLeaderboard(category: LeaderboardCategory, period: LeaderboardPeriod): void {
    this.emitNow('leaderboard:subscribe', { category, period });
  }

  unsubscribeLeaderboard(category: LeaderboardCategory, period: LeaderboardPeriod): void {
    this.emitNow('leaderboard:unsubscribe', { category, period });
  }

  // ------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------

  private emitWithAck<T>(event: string, ...args: unknown[]): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        this.commandQueue.push({ event, args, resolve: resolve as (v: unknown) => void, reject });
        // Intentar reconectar inmediatamente
        if (this.status === 'idle' || this.status === 'disconnected') {
          this.connect();
        }
        return;
      }
      this.socket.emit(event, ...args, (response: T) => {
        resolve(response);
      });
    });
  }

  private emitNow(event: string, ...args: unknown[]): void {
    if (this.socket?.connected) {
      this.socket.emit(event, ...args);
    }
    // Si no está conectado, el evento se descarta silenciosamente.
    // Los hooks pueden usar `useEffect` + `isConnected` para saber
    // cuándo reintentar.
  }

  private flushQueue(): void {
    if (!this.socket?.connected) return;
    while (this.commandQueue.length > 0) {
      const cmd = this.commandQueue.shift()!;
      try {
        this.socket.emit(cmd.event, ...cmd.args, (response: unknown) => {
          cmd.resolve(response);
        });
      } catch (err) {
        cmd.reject(err);
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    if (!this.currentToken) return; // No reconectar si no hay sesión

    const delay = RECONNECT_DELAYS_MS[Math.min(this.reconnectAttempts, RECONNECT_DELAYS_MS.length - 1)];
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.options.logger.log?.(`[socket] reconnecting (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private setStatus(s: ConnectionStatus): void {
    if (this.status === s) return;
    this.status = s;
    for (const l of this.listeners) {
      try {
        l(s);
      } catch (err) {
        this.options.logger.error?.('[socket] status listener error', err);
      }
    }
  }
}

// ------------------------------------------------------------
// Singleton
// ------------------------------------------------------------

let _instance: SocketClientImpl | null = null;

/**
 * Obtiene (o crea) el cliente socket singleton.
 * En SSR o tests, llamar con `{ autoConnect: false }` para evitar
 * intentos de conexión no deseados.
 */
export function getSocketClient(options?: SocketClientOptions): SocketClient {
  if (!_instance) {
    _instance = new SocketClientImpl(options);
  }
  return _instance;
}

/** Reset duro del singleton (sólo tests). */
export function __resetSocketClientForTests(): void {
  if (_instance) {
    _instance.disconnect();
    _instance = null;
  }
}

// Re-export de tipos útiles para los hooks
export type {
  LiveSessionState,
  BeatPayload,
  PausePayload,
  ResumePayload,
  EndPayload,
  LeaderboardCategory,
  LeaderboardPeriod,
} from './socket.types';
