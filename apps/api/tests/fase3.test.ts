/**
 * Tests de integración: leaderboard, shares, ear training.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/database.js';

const TEST_EMAIL = `test-leaderboard-${Date.now()}@example.com`;
const TEST_PASSWORD = 'test1234';
let token: string;
let userId: string;

beforeAll(async () => {
  // Limpiar datos de tests previos
  await prisma.earTrainingResult.deleteMany({ where: { user: { email: { startsWith: 'test-' } } } });
  await prisma.practiceSession.deleteMany({ where: { user: { email: { startsWith: 'test-' } } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } });

  // Crear usuario de test
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD, displayName: 'Tester' });

  token = registerRes.body.token;
  userId = registerRes.body.user.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } });
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Limpiar sesiones y resultados de ear training entre tests
  await prisma.practiceSession.deleteMany({ where: { userId } });
  await prisma.earTrainingResult.deleteMany({ where: { userId } });
});

describe('Ear Training', () => {
  it('POST /api/ear-training crea un resultado', async () => {
    const res = await request(app)
      .post('/api/ear-training')
      .set('Authorization', `Bearer ${token}`)
      .send({
        exerciseType: 'interval',
        question: { notes: ['C', 'E'], root: 'C' },
        answerGiven: 'Tercera mayor',
        correctAnswer: 'Tercera mayor',
        isCorrect: true,
        responseMs: 1500,
      });

    expect(res.status).toBe(201);
    expect(res.body.result.userId).toBe(userId);
  });

  it('GET /api/ear-training lista mis resultados', async () => {
    await request(app)
      .post('/api/ear-training')
      .set('Authorization', `Bearer ${token}`)
      .send({
        exerciseType: 'triad',
        question: { notes: ['C', 'E', 'G'], root: 'C' },
        answerGiven: 'Mayor',
        correctAnswer: 'Mayor',
        isCorrect: true,
        responseMs: 1200,
      });

    const res = await request(app)
      .get('/api/ear-training')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/ear-training/stats/me devuelve accuracy', async () => {
    // 2 correctos, 1 incorrecto
    await Promise.all([
      request(app).post('/api/ear-training').set('Authorization', `Bearer ${token}`).send({
        exerciseType: 'interval', question: { notes: ['C', 'G'], root: 'C' },
        answerGiven: 'a', correctAnswer: 'a', isCorrect: true, responseMs: 1000,
      }),
      request(app).post('/api/ear-training').set('Authorization', `Bearer ${token}`).send({
        exerciseType: 'interval', question: { notes: ['C', 'F'], root: 'C' },
        answerGiven: 'b', correctAnswer: 'c', isCorrect: false, responseMs: 1000,
      }),
    ]);

    const res = await request(app)
      .get('/api/ear-training/stats/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.byType.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Sessions stats', () => {
  it('GET /api/sessions/stats/me devuelve stats del usuario', async () => {
    // Crear sesión
    await prisma.practiceSession.create({
      data: {
        userId,
        songId: '00000000-0000-0000-0000-000000000000', // FK opcional con onDelete Cascade
        durationS: 600,
        completed: true,
      },
    });

    const res = await request(app)
      .get('/api/sessions/stats/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalSessions).toBeGreaterThanOrEqual(1);
    expect(res.body.totalMinutes).toBeGreaterThanOrEqual(10);
  });
});

describe('Leaderboard', () => {
  it('GET /api/leaderboard devuelve ranking por minutos', async () => {
    const res = await request(app)
      .get('/api/leaderboard')
      .query({ category: 'total_minutes', period: 'all_time' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.category).toBe('total_minutes');
    expect(res.body.period).toBe('all_time');
    expect(Array.isArray(res.body.entries)).toBe(true);
  });

  it('incluye myRank cuando el usuario autenticado tiene datos', async () => {
    await prisma.practiceSession.create({
      data: {
        userId,
        songId: '00000000-0000-0000-0000-000000000000',
        durationS: 600,
        completed: true,
      },
    });

    const res = await request(app)
      .get('/api/leaderboard')
      .query({ category: 'total_minutes' })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.myRank).toBeTypeOf('number');
  });
});

describe('Settings', () => {
  it('PATCH /api/users/:id/settings actualiza settings', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}/settings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tempo_bpm: 140, preferred_instrument: 'guitar' });

    expect(res.status).toBe(200);
    expect(res.body.user.settings.tempo_bpm).toBe(140);
    expect(res.body.user.settings.preferred_instrument).toBe('guitar');
  });

  it('POST /api/users/:id/xp añade XP al usuario', async () => {
    const res = await request(app)
      .post(`/api/users/${userId}/xp`)
      .set('Authorization', `Bearer ${token}`)
      .send({ xp: 50 });

    expect(res.status).toBe(200);
    expect(res.body.xp).toBeGreaterThanOrEqual(50);
  });

  it('rechaza PATCH a otro usuario (403)', async () => {
    const res = await request(app)
      .patch(`/api/users/00000000-0000-0000-0000-000000000000/settings`)
      .set('Authorization', `Bearer ${token}`)
      .send({ tempo_bpm: 100 });

    expect(res.status).toBe(403);
  });
});
