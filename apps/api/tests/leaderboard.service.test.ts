/**
 * Tests del servicio de leaderboard con cache.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    practiceSession: { groupBy: vi.fn() },
    earTrainingResult: { groupBy: vi.fn(), count: vi.fn() },
    user: { findMany: vi.fn() },
    leaderboardSnapshotCache: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock('../src/config/database.js', () => ({ prisma: mockPrisma }));

process.env.JWT_SECRET = 'test-secret-que-debe-tener-al-menos-32-caracteres-ok';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import {
  getLeaderboard,
  refreshLeaderboardCache,
  startLeaderboardCacheJob,
  __stopLeaderboardCacheJobForTests,
} from '../src/services/leaderboard.service.js';

describe('leaderboard service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __stopLeaderboardCacheJobForTests();
  });

  describe('getLeaderboard() sin cache', () => {
    it('calcula total_minutes en vivo', async () => {
      mockPrisma.leaderboardSnapshotCache.findUnique.mockResolvedValue(null);
      mockPrisma.practiceSession.groupBy.mockResolvedValue([
        { userId: 'u1', _sum: { durationS: 600 } }, // 10 min
        { userId: 'u2', _sum: { durationS: 1200 } }, // 20 min
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', displayName: 'Alice' },
        { id: 'u2', displayName: 'Bob' },
      ]);

      const result = await getLeaderboard({
        category: 'total_minutes',
        period: 'all_time',
      });
      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]).toEqual({
        rank: 1,
        userId: 'u2',
        displayName: 'Bob',
        score: 20,
      });
      expect(result.entries[1].score).toBe(10);
      expect(result.fromCache).toBe(false);
    });

    it('calcula sessions_completed', async () => {
      mockPrisma.leaderboardSnapshotCache.findUnique.mockResolvedValue(null);
      mockPrisma.practiceSession.groupBy.mockResolvedValue([
        { userId: 'u1', _count: { _all: 5 } },
        { userId: 'u2', _count: { _all: 3 } },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', displayName: 'A' },
        { id: 'u2', displayName: 'B' },
      ]);

      const result = await getLeaderboard({
        category: 'sessions_completed',
        period: 'weekly',
      });
      expect(result.entries[0].score).toBe(5);
      expect(result.entries[1].score).toBe(3);
    });

    it('calcula ear_training_accuracy como porcentaje', async () => {
      mockPrisma.leaderboardSnapshotCache.findUnique.mockResolvedValue(null);
      mockPrisma.earTrainingResult.groupBy.mockResolvedValue([
        { userId: 'u1', _count: { _all: 10 } },
        { userId: 'u2', _count: { _all: 4 } },
      ]);
      mockPrisma.earTrainingResult.count
        .mockResolvedValueOnce(7) // u1 correctas de 10 = 70%
        .mockResolvedValueOnce(4); // u2 correctas de 4 = 100%
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', displayName: 'A' },
        { id: 'u2', displayName: 'B' },
      ]);

      const result = await getLeaderboard({
        category: 'ear_training_accuracy',
        period: 'all_time',
      });
      // u2 (100%) > u1 (70%)
      expect(result.entries[0].userId).toBe('u2');
      expect(result.entries[0].score).toBe(100);
      expect(result.entries[1].score).toBe(70);
    });

    it('calcula myRank del usuario actual', async () => {
      mockPrisma.leaderboardSnapshotCache.findUnique.mockResolvedValue(null);
      mockPrisma.practiceSession.groupBy.mockResolvedValue([
        { userId: 'u1', _sum: { durationS: 600 } },
        { userId: 'u2', _sum: { durationS: 1200 } },
        { userId: 'u3', _sum: { durationS: 300 } },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', displayName: 'A' },
        { id: 'u2', displayName: 'B' },
        { id: 'u3', displayName: 'C' },
      ]);

      const result = await getLeaderboard({
        category: 'total_minutes',
        period: 'all_time',
        currentUserId: 'u3',
      });
      expect(result.myRank).toBe(3);
    });
  });

  describe('getLeaderboard() con cache', () => {
    it('usa cache cuando está vigente', async () => {
      const futureDate = new Date(Date.now() + 60_000);
      mockPrisma.leaderboardSnapshotCache.findUnique.mockResolvedValue({
        category: 'total_minutes',
        period: 'all_time',
        generatedAt: new Date(),
        expiresAt: futureDate,
        payload: {
          entries: [
            { rank: 1, userId: 'u1', displayName: 'Cached', score: 999 },
          ],
          myRanks: {},
        },
        totalUsers: 1,
      });
      // Para myRank
      mockPrisma.practiceSession.groupBy.mockResolvedValue([]);

      const result = await getLeaderboard({
        category: 'total_minutes',
        period: 'all_time',
      });
      expect(result.fromCache).toBe(true);
      expect(result.entries[0].displayName).toBe('Cached');
      expect(result.entries[0].score).toBe(999);
    });

    it('ignora cache expirado', async () => {
      const pastDate = new Date(Date.now() - 60_000);
      mockPrisma.leaderboardSnapshotCache.findUnique.mockResolvedValue({
        category: 'total_minutes',
        period: 'all_time',
        generatedAt: new Date(Date.now() - 600_000),
        expiresAt: pastDate,
        payload: { entries: [], myRanks: {} },
        totalUsers: 0,
      });
      mockPrisma.practiceSession.groupBy.mockResolvedValue([]);

      const result = await getLeaderboard({
        category: 'total_minutes',
        period: 'all_time',
      });
      expect(result.fromCache).toBe(false);
    });
  });

  describe('refreshLeaderboardCache()', () => {
    it('calcula y persiste el snapshot', async () => {
      mockPrisma.practiceSession.groupBy.mockResolvedValue([
        { userId: 'u1', _sum: { durationS: 600 } },
      ]);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'u1', displayName: 'A' },
      ]);
      mockPrisma.leaderboardSnapshotCache.upsert.mockResolvedValue({});

      const result = await refreshLeaderboardCache('total_minutes', 'all_time');
      expect(result.entries).toBe(1);
      expect(mockPrisma.leaderboardSnapshotCache.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category_period: { category: 'total_minutes', period: 'all_time' } },
          create: expect.objectContaining({
            category: 'total_minutes',
            period: 'all_time',
            totalUsers: 1,
          }),
        }),
      );
    });
  });

  describe('startLeaderboardCacheJob()', () => {
    it('inicia y se puede detener', () => {
      startLeaderboardCacheJob();
      // Segunda llamada no debe duplicar
      startLeaderboardCacheJob();
      __stopLeaderboardCacheJobForTests();
    });
  });
});
