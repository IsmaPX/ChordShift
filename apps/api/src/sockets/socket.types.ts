/**
 * Tipos del canal Socket.IO compartido por server y client.
 *
 * Convención: los eventos de servidor-a-cliente van en MAYÚSCULAS.
 * Los eventos de cliente-a-servidor van en minúsculas.
 *
 * Los handlers deben tipar `socket.data.userId` para usar la auth.
 */

import type {
  LiveSessionStatus,
  LeaderboardSnapshot,
  LiveSessionParticipant,
  BeatPayload,
  LeaderboardCategory,
  LeaderboardPeriod,
} from '@chordshift/db';

export type { LiveSessionStatus, LeaderboardSnapshot, LiveSessionParticipant, BeatPayload };

/**
 * Usuario enriquecido que viaja por el socket. Mantenemos `id` siempre
 * y `displayName` opcional para respetar el setting `pin_enabled`.
 */
export type SocketUser = {
  id: string;
  email: string;
  displayName: string | null;
};

export type LiveSessionStatePayload = {
  sessionId: string;
  hostId: string;
  songId: string;
  status: LiveSessionStatus;
  currentBeat: number;
  bpm: number;
  startedAtMs: number;
  participants: SocketUser[];
};

export type PausePayload = { sessionId: string; atBeat: number; atMs: number };
export type ResumePayload = { sessionId: string; atBeat: number; atMs: number };
export type EndPayload = { sessionId: string; endedAtMs: number };

export type JoinResponse =
  | { ok: true; state: LiveSessionStatePayload }
  | { ok: false; error: string };

export type AckResponse =
  | { ok: true }
  | { ok: false; error: string };

export type LeaderboardCategoryInput = LeaderboardCategory;
export type LeaderboardPeriodInput = LeaderboardPeriod;

export interface ServerToClientEvents {
  // Sesión en vivo
  'session:state': (state: LiveSessionStatePayload) => void;
  'session:beat': (payload: BeatPayload) => void;
  'session:paused': (payload: PausePayload) => void;
  'session:resumed': (payload: ResumePayload) => void;
  'session:ended': (payload: EndPayload) => void;
  'session:error': (payload: { message: string }) => void;
  'session:participant-joined': (payload: { sessionId: string; user: SocketUser }) => void;
  'session:participant-left': (payload: { sessionId: string; userId: string }) => void;

  // Leaderboard
  'leaderboard:updated': (snapshot: LeaderboardSnapshot) => void;

  // Sistema
  'pong': (payload: { atMs: number }) => void;
}

export interface ClientToServerEvents {
  // Sesión en vivo
  'session:join': (sessionId: string, ack: (response: JoinResponse) => void) => void;
  'session:leave': (sessionId: string) => void;
  'session:pause': (sessionId: string, ack: (response: AckResponse) => void) => void;
  'session:resume': (sessionId: string, ack: (response: AckResponse) => void) => void;
  'session:end': (sessionId: string, ack: (response: AckResponse) => void) => void;
  'session:beat-report': (payload: { sessionId: string; beat: number }) => void;

  // Leaderboard
  'leaderboard:subscribe': (payload: { category: string; period: string }) => void;
  'leaderboard:unsubscribe': (payload: { category: string; period: string }) => void;

  // Sistema
  'ping': (payload: { atMs: number }, ack: (response: { atMs: number }) => void) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  email: string;
  displayName: string | null;
}
