/**
 * Tipos del cliente WebSocket para la app web.
 *
 * Mantenemos una copia local de los tipos del canal (no importamos
 * desde `apps/api` para evitar acoplamiento al path del backend en build).
 * Si el contrato cambia, hay que actualizar AMBOS archivos.
 *
 * Convención: los payloads deben ser 100% compatibles con los tipos
 * exportados por `apps/api/src/sockets/socket.types.ts`.
 */

export type LiveSessionStatus = 'active' | 'paused' | 'ended';

export type SocketUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type LiveSessionState = {
  sessionId: string;
  hostId: string;
  songId: string;
  status: LiveSessionStatus;
  currentBeat: number;
  bpm: number;
  startedAtMs: number;
  participants: SocketUser[];
};

export type BeatPayload = {
  sessionId: string;
  beat: number;
  emittedAtMs: number;
};

export type PausePayload = { sessionId: string; atBeat: number; atMs: number };
export type ResumePayload = { sessionId: string; atBeat: number; atMs: number };
export type EndPayload = { sessionId: string; endedAtMs: number };

export type JoinResponse =
  | { ok: true; state: LiveSessionState }
  | { ok: false; error: string };

export type AckResponse = { ok: true } | { ok: false; error: string };

export type LeaderboardCategory = 'total_minutes' | 'sessions_completed' | 'ear_training_accuracy';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  displayName: string | null;
  score: number;
};

export type LeaderboardSnapshot = {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  generatedAtMs: number;
  entries: LeaderboardEntry[];
  myRank: number | null;
};

/** Map de handlers para cada evento servidor → cliente. */
export type ServerEventHandlers = {
  'session:state': (state: LiveSessionState) => void;
  'session:beat': (payload: BeatPayload) => void;
  'session:paused': (payload: PausePayload) => void;
  'session:resumed': (payload: ResumePayload) => void;
  'session:ended': (payload: EndPayload) => void;
  'session:error': (payload: { message: string }) => void;
  'session:participant-joined': (payload: { sessionId: string; user: SocketUser }) => void;
  'session:participant-left': (payload: { sessionId: string; userId: string }) => void;
  'leaderboard:updated': (snapshot: LeaderboardSnapshot) => void;
  'pong': (payload: { atMs: number }) => void;
};
