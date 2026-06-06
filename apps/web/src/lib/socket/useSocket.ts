/**
 * Hooks React sobre el cliente Socket.IO.
 *
 * Convenciones:
 * - `useSocket()`: acceso crudo al cliente (emit manual)
 * - `useSocketStatus()`: estado de conexión como React state
 * - `useLiveSession()`: unirse a una sesión y recibir beats/participantes
 * - `useLeaderboardRealtime()`: subscripción a updates de leaderboard
 *
 * Todos los hooks se limpian automáticamente al desmontar.
 */

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocketClient, type SocketClient, type ConnectionStatus } from './socketClient';
import type {
  LiveSessionState,
  BeatPayload,
  LeaderboardCategory,
  LeaderboardPeriod,
  LeaderboardSnapshot,
  AckResponse,
  JoinResponse,
} from './socket.types';

// =============================================================
// useSocket: acceso al cliente
// =============================================================

export function useSocket(): SocketClient {
  // El singleton se crea lazy; este hook nunca debe cambiar de identidad
  const ref = useRef<SocketClient | null>(null);
  if (!ref.current) {
    ref.current = getSocketClient();
  }
  return ref.current;
}

// =============================================================
// useSocketStatus: estado reactivo de la conexión
// =============================================================

const SERVER_STATUS_KEY = '__socket_status__';

function subscribeToStatus(callback: () => void): () => void {
  const socket = getSocketClient({ autoConnect: false });
  // Si no existe el singleton real, lo creamos
  if (!socket.isConnected() && socket.getStatus() === 'idle') {
    // No-op: el cliente se creará on-demand en useSocket
  }
  return socket.onStatusChange(callback);
}

function getServerStatusSnapshot(): ConnectionStatus {
  const socket = getSocketClient({ autoConnect: false });
  return socket.getStatus();
}

function getServerStatusServerSnapshot(): ConnectionStatus {
  return 'idle';
}

/**
 * Suscribe al estado de la conexión Socket.IO con `useSyncExternalStore`.
 * SSR-safe: devuelve 'idle' en el servidor.
 */
export function useSocketStatus(): ConnectionStatus {
  return useSyncExternalStore(
    subscribeToStatus,
    getServerStatusSnapshot,
    getServerStatusServerSnapshot,
  );
}

// =============================================================
// useLiveSession: unirse a una sesión y recibir updates
// =============================================================

export type UseLiveSessionOptions = {
  /** ID de la sesión a la que unirse. Si es null, no se une. */
  sessionId: string | null;
  /** Si es true, el usuario es el host (puede pausar/terminar). */
  isHost?: boolean;
  /** Callback opcional cuando llega un beat (útil para el host). */
  onBeat?: (payload: BeatPayload) => void;
  /** Callback opcional cuando llega un ack de pause/resume/end. */
  onAck?: (ack: AckResponse) => void;
};

export type UseLiveSessionResult = {
  /** Estado actual de la sesión. null hasta que `join` confirma. */
  state: LiveSessionState | null;
  /** True si la operación de join está en curso. */
  isJoining: boolean;
  /** Error de la última operación, si lo hubo. */
  error: string | null;
  /** Pausar (sólo host). */
  pause: () => Promise<AckResponse>;
  /** Reanudar (sólo host). */
  resume: () => Promise<AckResponse>;
  /** Finalizar (sólo host). */
  end: () => Promise<AckResponse>;
  /** Reportar beat actual (sólo host). El servidor lo propaga. */
  reportBeat: (beat: number) => void;
  /** Forzar re-unión (útil si la conexión se perdió). */
  reconnect: () => Promise<void>;
};

export function useLiveSession(options: UseLiveSessionOptions): UseLiveSessionResult {
  const socket = useSocket();
  const [state, setState] = useState<LiveSessionState | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joinedRef = useRef<string | null>(null);

  // Guardar callbacks en refs para evitar re-suscripciones innecesarias
  const onBeatRef = useRef(options.onBeat);
  const onAckRef = useRef(options.onAck);
  useEffect(() => {
    onBeatRef.current = options.onBeat;
    onAckRef.current = options.onAck;
  }, [options.onBeat, options.onAck]);

  // Unirse a la sesión
  useEffect(() => {
    if (!options.sessionId) {
      setState(null);
      return;
    }
    const sid = options.sessionId;

    let cancelled = false;
    setIsJoining(true);
    setError(null);

    void (async () => {
      try {
        const response: JoinResponse = await socket.joinSession(sid);
        if (cancelled) return;
        if (response.ok) {
          setState(response.state);
          joinedRef.current = sid;
        } else {
          setError(response.error);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al unirse');
        }
      } finally {
        if (!cancelled) setIsJoining(false);
      }
    })();

    return () => {
      cancelled = true;
      if (joinedRef.current) {
        socket.leaveSession(joinedRef.current);
        joinedRef.current = null;
      }
    };
  }, [options.sessionId, socket]);

  // Suscribirse a eventos de la sesión
  useEffect(() => {
    if (!options.sessionId) return;
    const sid = options.sessionId;

    const offState = socket.on('session:state', (newState: LiveSessionState) => {
      if (newState.sessionId === sid) setState(newState);
    });
    const offBeat = socket.on('session:beat', (payload: BeatPayload) => {
      if (payload.sessionId !== sid) return;
      setState(prev => (prev ? { ...prev, currentBeat: payload.beat } : prev));
      onBeatRef.current?.(payload);
    });
    const offPaused = socket.on('session:paused', payload => {
      if (payload.sessionId !== sid) return;
      setState(prev => (prev ? { ...prev, status: 'paused' } : prev));
      onAckRef.current?.({ ok: true });
    });
    const offResumed = socket.on('session:resumed', payload => {
      if (payload.sessionId !== sid) return;
      setState(prev => (prev ? { ...prev, status: 'active' } : prev));
      onAckRef.current?.({ ok: true });
    });
    const offEnded = socket.on('session:ended', payload => {
      if (payload.sessionId !== sid) return;
      setState(prev => (prev ? { ...prev, status: 'ended' } : prev));
    });
    const offParticipantJoined = socket.on('session:participant-joined', payload => {
      if (payload.sessionId !== sid) return;
      setState(prev => {
        if (!prev) return prev;
        if (prev.participants.some(p => p.id === payload.user.id)) return prev;
        return { ...prev, participants: [...prev.participants, payload.user] };
      });
    });
    const offParticipantLeft = socket.on('session:participant-left', payload => {
      if (payload.sessionId !== sid) return;
      setState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.filter(p => p.id !== payload.userId),
        };
      });
    });
    const offError = socket.on('session:error', payload => {
      setError(payload.message);
    });

    return () => {
      offState();
      offBeat();
      offPaused();
      offResumed();
      offEnded();
      offParticipantJoined();
      offParticipantLeft();
      offError();
    };
  }, [options.sessionId, socket]);

  const pause = useCallback(async () => {
    if (!options.sessionId) return { ok: false, error: 'Sin sesión' };
    return socket.pauseSession(options.sessionId);
  }, [options.sessionId, socket]);

  const resume = useCallback(async () => {
    if (!options.sessionId) return { ok: false, error: 'Sin sesión' };
    return socket.resumeSession(options.sessionId);
  }, [options.sessionId, socket]);

  const end = useCallback(async () => {
    if (!options.sessionId) return { ok: false, error: 'Sin sesión' };
    return socket.endSession(options.sessionId);
  }, [options.sessionId, socket]);

  const reportBeat = useCallback(
    (beat: number) => {
      if (!options.sessionId) return;
      socket.reportBeat(options.sessionId, beat);
    },
    [options.sessionId, socket],
  );

  const reconnect = useCallback(async () => {
    if (!options.sessionId) return;
    setIsJoining(true);
    setError(null);
    try {
      const response = await socket.joinSession(options.sessionId);
      if (response.ok) {
        setState(response.state);
        joinedRef.current = options.sessionId;
      } else {
        setError(response.error);
      }
    } finally {
      setIsJoining(false);
    }
  }, [options.sessionId, socket]);

  return {
    state,
    isJoining,
    error,
    pause,
    resume,
    end,
    reportBeat,
    reconnect,
  };
}

// =============================================================
// useLeaderboardRealtime: subscripción a updates
// =============================================================

export type UseLeaderboardRealtimeOptions = {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  /** Si se define, invalida esta query key al recibir update. */
  invalidateQueryKey?: readonly unknown[];
};

/**
 * Suscribe a updates de leaderboard en tiempo real. Si `invalidateQueryKey`
 * está definido, también invalida la query de TanStack Query correspondiente
 * para que se refetchee con los datos frescos del REST.
 *
 * Si no defines `invalidateQueryKey`, sólo se acumula el último snapshot
 * en el estado local.
 */
export function useLeaderboardRealtime(options: UseLeaderboardRealtimeOptions): {
  snapshot: LeaderboardSnapshot | null;
} {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [snapshot, setSnapshot] = useState<LeaderboardSnapshot | null>(null);

  useEffect(() => {
    socket.subscribeLeaderboard(options.category, options.period);

    const off = socket.on('leaderboard:updated', (newSnapshot: LeaderboardSnapshot) => {
      if (newSnapshot.category !== options.category) return;
      if (newSnapshot.period !== options.period) return;
      setSnapshot(newSnapshot);
      if (options.invalidateQueryKey) {
        void queryClient.invalidateQueries({ queryKey: options.invalidateQueryKey });
      }
    });

    return () => {
      off();
      socket.unsubscribeLeaderboard(options.category, options.period);
    };
  }, [
    socket,
    options.category,
    options.period,
    options.invalidateQueryKey,
    queryClient,
  ]);

  return { snapshot };
}
