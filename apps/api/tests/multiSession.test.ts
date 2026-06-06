/**
 * Tests del multi-host sessions (listado de sesiones activas).
 *
 * Estrategia: reutilizar el mock del service existente y verificar
 * que `listHostActiveSessions` filtra y devuelve correctamente.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

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

process.env.JWT_SECRET = 'test-secret-que-debe-tener-al-menos-32-caracteres-ok';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import { liveSessionRegistry } from '../src/sockets/liveSession.registry.js';
import {
  createSession,
  listHostActiveSessions,
} from '../src/services/liveSession.service.js';

describe('multi-session por host', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    liveSessionRegistry.__resetForTests();
  });

  it('el host puede crear múltiples sesiones simultáneas', async () => {
    mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 120 });
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-host',
      email: 'h@x.com',
      displayName: 'H',
    });
    let counter = 0;
    mockPrisma.liveSession.create.mockImplementation(() =>
      Promise.resolve({
        id: `sess-${++counter}`,
        hostId: 'user-host',
        songId: 'song-1',
        bpm: 120,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date(),
      }),
    );

    const s1 = await createSession({ hostId: 'user-host', songId: 'song-1', bpm: 120 });
    const s2 = await createSession({ hostId: 'user-host', songId: 'song-1', bpm: 120 });
    const s3 = await createSession({ hostId: 'user-host', songId: 'song-1', bpm: 120 });

    expect(s1.sessionId).not.toBe(s2.sessionId);
    expect(s2.sessionId).not.toBe(s3.sessionId);
    expect(liveSessionRegistry.list().filter(s => s.hostId === 'user-host')).toHaveLength(3);
  });

  it('listHostActiveSessions filtra por host', async () => {
    mockPrisma.song.findUnique.mockResolvedValue({ id: 'song-1', bpm: 120 });
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a', displayName: 'A' });
    let counter = 0;
    mockPrisma.liveSession.create.mockImplementation(({ data }) =>
      Promise.resolve({
        id: `s-${data.hostId}-${++counter}`,
        hostId: data.hostId,
        songId: 'song-1',
        bpm: 120,
        status: 'active',
        currentBeat: 0,
        startedAt: new Date(),
      }),
    );
    // Mockear findMany para que retorne array vacío por defecto
    mockPrisma.liveSession.findMany.mockResolvedValue([]);

    // Host 1 crea 2 sesiones
    await createSession({ hostId: 'host-1', songId: 'song-1', bpm: 120 });
    await createSession({ hostId: 'host-1', songId: 'song-1', bpm: 120 });
    // Host 2 crea 1 sesión
    await createSession({ hostId: 'host-2', songId: 'song-1', bpm: 120 });

    const host1Sessions = await listHostActiveSessions('host-1');
    const host2Sessions = await listHostActiveSessions('host-2');
    const host3Sessions = await listHostActiveSessions('host-3-no-existe');

    expect(host1Sessions).toHaveLength(2);
    expect(host2Sessions).toHaveLength(1);
    expect(host3Sessions).toHaveLength(0);

    // Todas las sesiones de host-1 son suyas
    expect(host1Sessions.every(s => s.hostId === 'host-1')).toBe(true);
  });

  it('listHostActiveSessions hace fallback a DB si el registry está vacío', async () => {
    // No creamos nada en el registry, simulamos server restart
    liveSessionRegistry.__resetForTests();
    mockPrisma.liveSession.findMany.mockResolvedValue([
      {
        id: 'sess-recovered',
        hostId: 'host-1',
        songId: 'song-1',
        bpm: 100,
        status: 'active',
        currentBeat: 5,
        startedAt: new Date(),
      },
    ]);

    const result = await listHostActiveSessions('host-1');
    expect(result).toHaveLength(1);
    expect(result[0].sessionId).toBe('sess-recovered');
    expect(liveSessionRegistry.exists('sess-recovered')).toBe(true);
  });
});
