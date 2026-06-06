/**
 * Tests de integración del socket server.
 *
 * Estrategia: levantar el HTTP server en puerto 0 (asignado por el SO),
 * conectar con socket.io-client, validar el handshake y los eventos.
 *
 * No tocamos Prisma para no requerir DB en estos tests. El middleware
 * de auth se bypasea inyectando un token válido y mockeando prisma.user.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { createServer } from 'node:http';
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';
import { createSocketServer } from '../src/sockets/socketServer.js';
import { liveSessionRegistry } from '../src/sockets/liveSession.registry.js';

// Setear JWT_SECRET ANTES de importar módulos que lo lean
const JWT_SECRET = 'test-secret-que-debe-tener-al-menos-32-caracteres-ok';
process.env.JWT_SECRET = JWT_SECRET;
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mockear prisma para evitar conexión a DB
vi.mock('../src/config/database.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id === 'user-host') {
          return Promise.resolve({ id: 'user-host', email: 'host@x.com', displayName: 'Host' });
        }
        if (where.id === 'user-other') {
          return Promise.resolve({ id: 'user-other', email: 'other@x.com', displayName: 'Other' });
        }
        return Promise.resolve(null);
      }),
    },
    liveSession: {
      create: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          id: 'sess-test',
          hostId: data.hostId,
          songId: data.songId,
          bpm: data.bpm,
          status: 'active',
          currentBeat: 0,
          startedAt: new Date(),
        }),
      ),
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
  },
}));

// Mockear el leaderboard service
vi.mock('../src/services/leaderboard.service.js', () => ({
  getLeaderboard: vi.fn().mockResolvedValue({
    entries: [{ rank: 1, userId: 'user-host', displayName: 'Host', score: 100 }],
    myRank: 1,
  }),
}));

const validToken = jwt.sign({ userId: 'user-host', email: 'host@x.com' }, JWT_SECRET);
const otherToken = jwt.sign({ userId: 'user-other', email: 'other@x.com' }, JWT_SECRET);

let httpServer: ReturnType<typeof createServer>;
let port: number;
let io: ReturnType<typeof createSocketServer>;

beforeAll(async () => {
  httpServer = createServer();
  io = createSocketServer(httpServer);
  await new Promise<void>(resolve => {
    httpServer.listen(0, () => {
      port = (httpServer.address() as { port: number }).port;
      resolve();
    });
  });
});

afterAll(async () => {
  io.close();
  await new Promise<void>(resolve => {
    httpServer.close(() => resolve());
  });
});

beforeEach(() => {
  liveSessionRegistry.__resetForTests();
  // Pre-crear la sesión para que los clientes puedan hacer join
  liveSessionRegistry.create({
    sessionId: 'sess-test',
    hostId: 'user-host',
    songId: 'song-1',
    status: 'active',
    currentBeat: 0,
    bpm: 120,
    startedAtMs: Date.now(),
  });
});

function connect(token: string): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const sock = ioc(`http://localhost:${port}`, {
      auth: { token },
      transports: ['websocket'],
      reconnection: false,
    });
    sock.on('connect', () => resolve(sock));
    sock.on('connect_error', reject);
    setTimeout(() => reject(new Error('timeout')), 3000);
  });
}

describe('Socket.IO server', () => {
  it('rechaza conexiones sin token', async () => {
    const sock = ioc(`http://localhost:${port}`, {
      transports: ['websocket'],
      reconnection: false,
    });
    const err: Error = await new Promise(resolve => {
      sock.on('connect_error', resolve);
      sock.on('connect', () => resolve(new Error('should not connect')));
    });
    expect(err.message.toLowerCase()).toMatch(/token/);
    sock.disconnect();
  });

  it('rechaza conexiones con token inválido', async () => {
    const sock = ioc(`http://localhost:${port}`, {
      auth: { token: 'token-basura' },
      transports: ['websocket'],
      reconnection: false,
    });
    const err: Error = await new Promise(resolve => {
      sock.on('connect_error', resolve);
      sock.on('connect', () => resolve(new Error('should not connect')));
    });
    expect(err.message).toBeDefined();
    sock.disconnect();
  });

  it('acepta conexiones con token válido', async () => {
    const sock = await connect(validToken);
    expect(sock.connected).toBe(true);
    sock.disconnect();
  });

  it('permite hacer join a una sesión y devuelve el estado', async () => {
    const sock = await connect(validToken);
    const response = await new Promise<{ ok: boolean; state?: { sessionId: string }; error?: string }>(resolve => {
      sock.emit('session:join', 'sess-test', resolve);
    });
    expect(response.ok).toBe(true);
    expect(response.state?.sessionId).toBe('sess-test');
    sock.disconnect();
  });

  it('rechaza join a sesión inexistente', async () => {
    const sock = await connect(validToken);
    const response = await new Promise<{ ok: boolean; error?: string }>(resolve => {
      sock.emit('session:join', 'sess-inexistente', resolve);
    });
    expect(response.ok).toBe(false);
    expect(response.error?.toLowerCase()).toMatch(/no encontrada/);
    sock.disconnect();
  });

  it('el host puede pausar y reanudar', async () => {
    const sock = await connect(validToken);
    await new Promise<void>(resolve => {
      sock.emit('session:join', 'sess-test', () => resolve());
    });

    const pauseAck = await new Promise<{ ok: boolean }>(resolve => {
      sock.emit('session:pause', 'sess-test', resolve);
    });
    expect(pauseAck.ok).toBe(true);
    expect(liveSessionRegistry.get('sess-test')?.status).toBe('paused');

    const resumeAck = await new Promise<{ ok: boolean }>(resolve => {
      sock.emit('session:resume', 'sess-test', resolve);
    });
    expect(resumeAck.ok).toBe(true);
    expect(liveSessionRegistry.get('sess-test')?.status).toBe('active');

    sock.disconnect();
  });

  it('un participante que no es host no puede pausar', async () => {
    const hostSock = await connect(validToken);
    await new Promise<void>(resolve => {
      hostSock.emit('session:join', 'sess-test', () => resolve());
    });
    hostSock.disconnect();

    const otherSock = await connect(otherToken);
    await new Promise<void>(resolve => {
      otherSock.emit('session:join', 'sess-test', () => resolve());
    });

    const ack = await new Promise<{ ok: boolean; error?: string }>(resolve => {
      otherSock.emit('session:pause', 'sess-test', resolve);
    });
    expect(ack.ok).toBe(false);
    expect(ack.error?.toLowerCase()).toMatch(/host/);
    otherSock.disconnect();
  });

  it('el host puede reportar beats y se emiten a los participantes', async () => {
    const hostSock = await connect(validToken);
    const otherSock = await connect(otherToken);

    await new Promise<void>(resolve => {
      hostSock.emit('session:join', 'sess-test', () => resolve());
    });
    await new Promise<void>(resolve => {
      otherSock.emit('session:join', 'sess-test', () => resolve());
    });

    const beatPromise = new Promise<{ beat: number }>(resolve => {
      otherSock.on('session:beat', resolve);
    });

    hostSock.emit('session:beat-report', { sessionId: 'sess-test', beat: 42 });

    const beat = await beatPromise;
    expect(beat.beat).toBe(42);

    hostSock.disconnect();
    otherSock.disconnect();
  });

  it('un participante que no es host no puede reportar beats', async () => {
    const otherSock = await connect(otherToken);
    await new Promise<void>(resolve => {
      otherSock.emit('session:join', 'sess-test', () => resolve());
    });

    const errorPromise = new Promise<{ message: string }>(resolve => {
      otherSock.on('session:error', resolve);
    });

    otherSock.emit('session:beat-report', { sessionId: 'sess-test', beat: 99 });
    const err = await errorPromise;
    expect(err.message.toLowerCase()).toMatch(/host/);

    otherSock.disconnect();
  });

  it('endSession finaliza y desconecta a todos', async () => {
    const hostSock = await connect(validToken);
    const otherSock = await connect(otherToken);

    await new Promise<void>(resolve => {
      hostSock.emit('session:join', 'sess-test', () => resolve());
    });
    await new Promise<void>(resolve => {
      otherSock.emit('session:join', 'sess-test', () => resolve());
    });

    const endedPromise = new Promise<{ sessionId: string }>(resolve => {
      otherSock.on('session:ended', resolve);
    });

    // Importante: socket.emit con callback de 3 argumentos espera que
    // el server llame al callback. Aumentamos el timeout del test.
    const ack = await Promise.race([
      new Promise<{ ok: boolean }>(resolve => {
        hostSock.emit('session:end', 'sess-test', resolve);
      }),
      new Promise<{ ok: boolean }>((_, reject) =>
        setTimeout(() => reject(new Error('ack timeout')), 3000),
      ),
    ]);
    expect(ack.ok).toBe(true);

    const ended = await endedPromise;
    expect(ended.sessionId).toBe('sess-test');

    // Esperar a que la desconexión se propague
    await new Promise(r => setTimeout(r, 200));
    expect(otherSock.connected).toBe(false);
    expect(hostSock.connected).toBe(false);
  }, 10_000);
});
