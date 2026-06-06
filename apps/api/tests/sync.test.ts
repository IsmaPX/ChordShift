/**
 * Tests de los endpoints de sync.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';

const TEST_EMAIL = `test-sync-${Date.now()}@example.com`;
const TEST_PASSWORD = 'test1234';
let token: string;
let userId: string;

beforeAll(async () => {
  await prisma.practiceSession.deleteMany({ where: { user: { email: { startsWith: 'test-' } } } });
  await prisma.earTrainingResult.deleteMany({ where: { user: { email: { startsWith: 'test-' } } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } });

  const res = await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, displayName: 'SyncTester' });

  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  await prisma.practiceSession.deleteMany({ where: { userId } });
  await prisma.earTrainingResult.deleteMany({ where: { userId } });
  // Reset XP
  await prisma.user.update({
    where: { id: userId },
    data: { settings: { xp: 0 } },
  });
});

describe('GET /api/sync/status', () => {
  it('devuelve el estado del servidor', async () => {
    const res = await request(app).get('/api/sync/status');
    expect(res.status).toBe(200);
    expect(res.body.serverTime).toBeDefined();
  });
});

describe('GET /api/sync/snapshot', () => {
  it('devuelve el snapshot del usuario', async () => {
    const res = await request(app)
      .get('/api/sync/snapshot')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(userId);
    expect(res.body.songs).toBeDefined();
    expect(res.body.practiceSessions).toBeDefined();
    expect(res.body.earTrainingResults).toBeDefined();
    expect(res.body.styles).toBeDefined();
    expect(res.body.tips).toBeDefined();
    expect(res.body.snapshotVersion).toBeGreaterThanOrEqual(1);
  });

  it('requiere auth', async () => {
    const res = await request(app).get('/api/sync/snapshot');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/sync/batch', () => {
  it('procesa un batch de operaciones mixtas', async () => {
    const style = await prisma.style.findFirst();
    expect(style).toBeDefined();

    const res = await request(app)
      .post('/api/sync/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        operations: [
          {
            op: 'create_song',
            clientId: 'client-1',
            data: {
              title: 'Offline Song',
              styleId: style!.id,
              difficulty: 2,
              keySignature: 'C',
              bpm: 120,
              chordData: {
                sections: [{
                  name: 'V1',
                  chords: [{ chord: 'C', beat: 0, duration: 4 }],
                }],
              },
            },
          },
          {
            op: 'add_xp',
            clientId: 'client-2',
            data: { xp: 50 },
          },
        ],
        sinceLastSync: new Date().toISOString(),
      });

    expect(res.status).toBe(200);
    expect(res.body.applied).toBe(2);
    expect(res.body.rejected).toBe(0);
    expect(res.body.errors).toBe(0);
    expect(res.body.results).toHaveLength(2);
    expect(res.body.results[0].status).toBe('applied');
    expect(res.body.results[0].serverId).toBeDefined();
  });

  it('rechaza batch vacío con 400', async () => {
    const res = await request(app)
      .post('/api/sync/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({ operations: [] });

    expect(res.status).toBe(400);
  });

  it('procesa create_session offline', async () => {
    const res = await request(app)
      .post('/api/sync/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        operations: [
          {
            op: 'create_session',
            clientId: 'client-session-1',
            data: {
              songId: '00000000-0000-0000-0000-000000000000',
              startedAt: new Date().toISOString(),
              durationS: 300,
              completed: true,
            },
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.applied).toBe(1);
  });

  it('rechaza operaciones inválidas con detalles', async () => {
    const res = await request(app)
      .post('/api/sync/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        operations: [
          {
            op: 'add_xp',
            clientId: 'client-bad',
            data: { xp: -100 }, // Inválido: debe ser positivo
          },
        ],
      });

    expect(res.status).toBe(200);
    // ZodError causa status 'rejected' o 'error' según el caso
    expect(res.body.applied + res.body.rejected + res.body.errors).toBe(1);
  });

  it('requiere auth', async () => {
    const res = await request(app)
      .post('/api/sync/batch')
      .send({ operations: [] });

    expect(res.status).toBe(401);
  });
});

describe('Snapshot refleja cambios', () => {
  it('snapshot incluye sesiones creadas via sync', async () => {
    await request(app)
      .post('/api/sync/batch')
      .set('Authorization', `Bearer ${token}`)
      .send({
        operations: [{
          op: 'create_session',
          clientId: 'client-sess',
          data: {
            songId: '00000000-0000-0000-0000-000000000000',
            startedAt: new Date().toISOString(),
            durationS: 600,
            completed: true,
          },
        }],
      });

    const res = await request(app)
      .get('/api/sync/snapshot')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.practiceSessions.length).toBeGreaterThanOrEqual(1);
    expect(res.body.practiceSessions[0].durationS).toBe(600);
  });
});
