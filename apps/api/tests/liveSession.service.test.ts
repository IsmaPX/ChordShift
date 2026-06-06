/**
 * Tests del servicio de sesiones en vivo.
 *
 * Enfoque: mockear Prisma para no requerir DB. Verificamos la lógica
 * de recovery y persistencia de endedAt.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// vi.hoisted se ejecuta ANTES de los imports y permite que las
// variables estén disponibles en el factory de vi.mock
const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    song: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    liveSession: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('../src/config/database.js', () => ({ prisma: mockPrisma }));

// Importar DESPUÉS de los mocks
import { liveSessionRegistry } from '../src/sockets/liveSession.registry.js';
import {
  createSession,
  getSession,
  endSession,
  updateBeat,
  recoverFromDatabase,
  LiveSessionServiceError,
} from '../src/services/liveSession.service.js';

describe('liveSession.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    liveSessionRegistry.__resetForTests();
  });

  afterEach(() => {
    liveSessionRegistry.__resetForTests();
  });

  describe('createSession', () => {
    it('crea una sesión y la registra en el registry', async () => {
      mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 100 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@x.com', displayName: 'A' });
      mockPrisma.liveSession.create.mockResolvedValue({
        id: 'sess-svc-1',
        hostId: 'user-1',
        songId: 'song-1',
        bpm: 120,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date('2024-01-01T00:00:00Z'),
      });

      const state = await createSession({ hostId: 'user-1', songId: 'song-1', bpm: 120 });
      expect(state.sessionId).toBe('sess-svc-1');
      expect(state.bpm).toBe(120);
      expect(liveSessionRegistry.get('sess-svc-1')).toBeDefined();
    });

    it('lanza NOT_FOUND si la canción no existe', async () => {
      mockPrisma.song.findUnique.mockResolvedValue(null);
      await expect(
        createSession({ hostId: 'user-1', songId: 'song-x', bpm: 120 }),
      ).rejects.toThrow(LiveSessionServiceError);
    });

    it('usa el bpm de la canción si no se especifica', async () => {
      mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 90 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@x.com', displayName: 'A' });
      mockPrisma.liveSession.create.mockResolvedValue({
        id: 'sess-svc-2',
        hostId: 'user-1',
        songId: 'song-1',
        bpm: 90,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date(),
      });

      const state = await createSession({ hostId: 'user-1', songId: 'song-1', bpm: 0 });
      expect(state.bpm).toBe(90);
    });
  });

  describe('endSession', () => {
    it('persiste endedAt en Prisma via lifecycle hook', async () => {
      mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 120 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@x.com', displayName: 'A' });
      mockPrisma.liveSession.create.mockResolvedValue({
        id: 'sess-svc-3',
        hostId: 'user-1',
        songId: 'song-1',
        bpm: 120,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date(),
      });
      mockPrisma.liveSession.update.mockResolvedValue({});

      await createSession({ hostId: 'user-1', songId: 'song-1', bpm: 120 });
      await endSession('sess-svc-3', 'user-1');

      // Esperar al microtask que ejecuta el update
      await new Promise(r => setTimeout(r, 10));

      expect(mockPrisma.liveSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-svc-3' },
          data: expect.objectContaining({
            status: 'ended',
            endedAt: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('updateBeat', () => {
    it('persiste el beat en Prisma (best-effort)', async () => {
      mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 120 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@x.com', displayName: 'A' });
      mockPrisma.liveSession.create.mockResolvedValue({
        id: 'sess-beat',
        hostId: 'user-1',
        songId: 'song-1',
        bpm: 120,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date(),
      });
      mockPrisma.liveSession.update.mockResolvedValue({});

      await createSession({ hostId: 'user-1', songId: 'song-1', bpm: 120 });
      const result = await updateBeat('sess-beat', 42);

      expect(result?.emittedAtMs).toBeGreaterThan(0);
      await new Promise(r => setTimeout(r, 10));
      expect(mockPrisma.liveSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sess-beat' },
          data: { currentBeat: 42 },
        }),
      );
    });

    it('devuelve null si la sesión no existe', async () => {
      const result = await updateBeat('no-existe', 1);
      expect(result).toBeNull();
    });
  });

  describe('recoverFromDatabase', () => {
    it('rehidrata sesiones activas de la base de datos', async () => {
      const recentDate = new Date(Date.now() - 1000);
      mockPrisma.liveSession.findMany.mockResolvedValue([
        {
          id: 'sess-recover-1',
          hostId: 'user-1',
          songId: 'song-1',
          bpm: 100,
          status: 'active',
          currentBeat: 5,
          startedAt: recentDate,
          host: { id: 'user-1', email: 'a@x.com', displayName: 'A' },
        },
        {
          id: 'sess-recover-2',
          hostId: 'user-2',
          songId: 'song-2',
          bpm: 80,
          status: 'active',
          currentBeat: 0,
          startedAt: recentDate,
          host: { id: 'user-2', email: 'b@x.com', displayName: 'B' },
        },
      ]);

      const count = await recoverFromDatabase();
      expect(count).toBe(2);
      expect(liveSessionRegistry.exists('sess-recover-1')).toBe(true);
      expect(liveSessionRegistry.exists('sess-recover-2')).toBe(true);

      const s1 = liveSessionRegistry.get('sess-recover-1');
      expect(s1?.currentBeat).toBe(5);
      expect(s1?.bpm).toBe(100);
    });

    it('devuelve 0 si no hay sesiones para recuperar', async () => {
      mockPrisma.liveSession.findMany.mockResolvedValue([]);
      const count = await recoverFromDatabase();
      expect(count).toBe(0);
    });

    it('ignora sesiones más antiguas que el TTL', async () => {
      // El query filtra por cutoff; simulamos que la query devuelve []
      mockPrisma.liveSession.findMany.mockResolvedValue([]);
      const count = await recoverFromDatabase();
      expect(count).toBe(0);
      // Verificamos que la query SÍ aplicó el filtro de cutoff
      expect(mockPrisma.liveSession.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'active',
            startedAt: expect.objectContaining({ gte: expect.any(Date) }),
          }),
        }),
      );
    });
  });

  describe('getSession', () => {
    it('devuelve el estado desde el registry si existe', async () => {
      mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 120 });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'a@x.com', displayName: 'A' });
      mockPrisma.liveSession.create.mockResolvedValue({
        id: 'sess-get',
        hostId: 'user-1',
        songId: 'song-1',
        bpm: 120,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date(),
      });

      const created = await createSession({ hostId: 'user-1', songId: 'song-1', bpm: 120 });
      const fetched = await getSession(created.sessionId);
      expect(fetched?.sessionId).toBe(created.sessionId);
      // No debe haber hecho query a Prisma (el registry es autoritativo)
    });

    it('rehidrata desde Prisma si no está en el registry', async () => {
      const recentDate = new Date(Date.now() - 1000);
      mockPrisma.liveSession.findUnique.mockResolvedValue({
        id: 'sess-cold',
        hostId: 'user-1',
        songId: 'song-1',
        bpm: 110,
        status: 'active',
        currentBeat: 7,
        startedAt: recentDate,
        host: { id: 'user-1', email: 'a@x.com', displayName: 'A' },
      });

      const state = await getSession('sess-cold');
      expect(state?.bpm).toBe(110);
      expect(state?.currentBeat).toBe(7);
      expect(liveSessionRegistry.exists('sess-cold')).toBe(true);
    });

    it('devuelve null si la sesión está finalizada en DB', async () => {
      mockPrisma.liveSession.findUnique.mockResolvedValue({
        id: 'sess-ended',
        status: 'ended',
        startedAt: new Date(),
      });
      const state = await getSession('sess-ended');
      expect(state).toBeNull();
    });
  });
});
