/**
 * Tipos de respuesta de la API backend.
 * Mantener sincronizado con apps/api/src/controllers y validators.
 */

import type { Song, Style, Tip, UserSettings, PracticeSession } from '@/types/music';

export interface ApiUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string;
  lastActiveAt?: string | null;
  settings?: UserSettings;
}

export interface AuthResponse {
  user: ApiUser;
  token: string;
}

export interface MeResponse {
  user: ApiUser;
}

export interface SongsListResponse {
  songs: Song[];
  total: number;
  limit: number;
  offset: number;
}

export interface SongResponse {
  song: Song & {
    style?: Style;
    createdBy?: { id: string; displayName: string | null };
  };
}

export interface SessionsListResponse {
  sessions: PracticeSession[];
}

export interface SessionResponse {
  session: PracticeSession;
}

export interface UserStatsResponse {
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  uniqueDays: number;
}

export interface CatalogStylesResponse {
  styles: Style[];
}

export interface CatalogTipsResponse {
  tips: Tip[];
}
