/**
 * Hooks de TanStack Query para los nuevos endpoints del backend.
 *
 * - useUserStats: total minutos, sesiones completadas, días activos
 * - useEarTrainingStats: accuracy, breakdown por tipo
 * - useLeaderboard: ranking de usuarios
 * - useSharedSongs: canciones compartidas conmigo
 * - useSongShare: crear/revocar shares
 * - useUploadAudio: subir audio de una canción
 */

import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { tokenStore } from '@/lib/api/tokenStore';

// ============================================================================
// USER STATS
// ============================================================================

export interface UserStats {
  totalSessions: number;
  totalMinutes: number;
  completedSessions: number;
  uniqueDays: number;
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats', tokenStore.getUser()?.id],
    queryFn: () => apiClient.get<UserStats>('/api/sessions/stats/me'),
    staleTime: 1000 * 60, // 1 min
  });
}

// ============================================================================
// EAR TRAINING STATS
// ============================================================================

export interface EarTrainingStats {
  total: number;
  correct: number;
  accuracy: number;
  byType: Array<{
    exerciseType: string;
    count: number;
    avgResponseMs: number;
  }>;
}

export function useEarTrainingStats() {
  return useQuery({
    queryKey: ['ear-training-stats', tokenStore.getUser()?.id],
    queryFn: () => apiClient.get<EarTrainingStats>('/api/ear-training/stats/me'),
    staleTime: 1000 * 60,
  });
}

// ============================================================================
// LEADERBOARD
// ============================================================================

export type LeaderboardCategory = 'total_minutes' | 'sessions_completed' | 'ear_training_accuracy';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string | null;
  score: number;
}

export interface LeaderboardResponse {
  category: LeaderboardCategory;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  myRank: number | null;
}

export function useLeaderboard(
  category: LeaderboardCategory = 'total_minutes',
  period: LeaderboardPeriod = 'all_time',
  limit = 20,
) {
  return useQuery({
    queryKey: ['leaderboard', category, period, limit],
    queryFn: () => apiClient.get<LeaderboardResponse>('/api/leaderboard', {
      query: { category, period, limit },
    }),
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

// ============================================================================
// SONG SHARES
// ============================================================================

export interface SongShare {
  id: string;
  songId: string;
  permission: 'view' | 'edit';
  createdAt: string;
  song?: { id: string; title: string; artist: string | null };
  sharedBy?: { id: string; displayName: string | null; email: string };
  sharedWith?: { id: string; displayName: string | null; email: string };
}

export function useSharedWithMe() {
  return useQuery({
    queryKey: ['shared-with-me', tokenStore.getUser()?.id],
    queryFn: () => apiClient.get<{ shares: SongShare[] }>('/api/shares/received'),
    staleTime: 1000 * 60,
  });
}

export function useMyShares() {
  return useQuery({
    queryKey: ['my-shares', tokenStore.getUser()?.id],
    queryFn: () => apiClient.get<{ shares: SongShare[] }>('/api/shares/sent'),
    staleTime: 1000 * 60,
  });
}

export function useCreateShare(
  options?: UseMutationOptions<SongShare, Error, { songId: string; sharedWithEmail: string; permission?: 'view' | 'edit' }>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      apiClient
        .post<{ share: SongShare }>('/api/shares', {
          songId: input.songId,
          sharedWithEmail: input.sharedWithEmail,
          permission: input.permission ?? 'view',
        })
        .then((res) => res.share),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['my-shares'] });
      void qc.invalidateQueries({ queryKey: ['shared-with-me'] });
    },
    ...options,
  });
}

export function useRevokeShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shareId: string) =>
      apiClient.delete<void>(`/api/shares/${shareId}`),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['my-shares'] });
      void qc.invalidateQueries({ queryKey: ['shared-with-me'] });
    },
  });
}

// ============================================================================
// AUDIO UPLOAD
// ============================================================================

export function useUploadAudio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ songId, file, name, type }: { songId: string; file: Blob; name: string; type: string }) => {
      const formData = new FormData();
      formData.append('audio', file, name);
      formData.append('name', name);
      formData.append('type', type);

      const token = tokenStore.getToken();
      const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

      const response = await fetch(`${apiBase}/api/songs/${songId}/audio`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error ?? 'Upload failed');
      }
      return response.json();
    },
    onSuccess: (_, vars) => {
      void qc.invalidateQueries({ queryKey: ['song-audio', vars.songId] });
    },
  });
}

export function useSongAudio(songId: string | null) {
  return useQuery({
    queryKey: ['song-audio', songId],
    queryFn: () =>
      apiClient
        .get<{ audio: { url: string; name: string; size: number; mimeType: string } }>(`/api/songs/${songId}/audio`)
        .catch((err) => {
          if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 404) {
            return null;
          }
          throw err;
        }),
    enabled: !!songId,
  });
}
