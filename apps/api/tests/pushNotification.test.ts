/**
 * Tests del servicio de push notifications.
 *
 * En dry-run mode (VAPID no configurado), `sendToUser` sólo loguea.
 * Cubrimos ese comportamiento + el manejo de suscripciones expiradas.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

const { mockPrisma, mockSendNotification } = vi.hoisted(() => ({
  mockPrisma: {
    pushSubscription: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      update: vi.fn(),
    },
  },
  mockSendNotification: vi.fn(),
}));

vi.mock('../src/config/database.js', () => ({ prisma: mockPrisma }));
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: mockSendNotification,
  },
}));

process.env.JWT_SECRET = 'test-secret-que-debe-tener-al-menos-32-caracteres-ok';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
// Intencionalmente NO seteamos VAPID_PUBLIC_KEY para que esté en dry-run

import {
  subscribe,
  unsubscribe,
  sendToUser,
  getPublicVapidKey,
  __resetForTests,
} from '../src/services/pushNotification.service.js';

describe('pushNotification service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetForTests();
  });

  afterEach(() => {
    __resetForTests();
  });

  describe('subscribe()', () => {
    it('registra una nueva suscripción', async () => {
      mockPrisma.pushSubscription.upsert.mockResolvedValue({ id: 'sub-1' });
      const result = await subscribe(
        'user-1',
        { endpoint: 'https://push.example.com/abc', keys: { p256dh: 'p1', auth: 'a1' } },
        'Mozilla/5.0',
      );
      expect(result.id).toBe('sub-1');
      expect(mockPrisma.pushSubscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { endpoint: 'https://push.example.com/abc' },
          create: expect.objectContaining({
            userId: 'user-1',
            endpoint: 'https://push.example.com/abc',
            p256dh: 'p1',
            auth: 'a1',
            userAgent: 'Mozilla/5.0',
          }),
        }),
      );
    });
  });

  describe('unsubscribe()', () => {
    it('elimina la suscripción por endpoint', async () => {
      mockPrisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });
      await unsubscribe('https://push.example.com/abc');
      expect(mockPrisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { endpoint: 'https://push.example.com/abc' },
      });
    });
  });

  describe('sendToUser()', () => {
    it('devuelve skipped=true sin VAPID configurado (dry-run)', async () => {
      const result = await sendToUser('user-1', { title: 'Test' });
      expect(result.skipped).toBe(true);
      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    it('devuelve sent=0 si el usuario no tiene suscripciones', async () => {
      // Forzar VAPID configurado via env
      process.env.VAPID_PUBLIC_KEY = 'public-key';
      process.env.VAPID_PRIVATE_KEY = 'private-key';
      __resetForTests();

      mockPrisma.pushSubscription.findMany.mockResolvedValue([]);

      const result = await sendToUser('user-1', { title: 'Test' });
      expect(result.sent).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(false);

      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
    });

    it('envía y cuenta successes correctamente', async () => {
      process.env.VAPID_PUBLIC_KEY = 'public-key';
      process.env.VAPID_PRIVATE_KEY = 'private-key';
      __resetForTests();

      mockPrisma.pushSubscription.findMany.mockResolvedValue([
        { id: 'sub-1', endpoint: 'https://a', p256dh: 'p', auth: 'a' },
        { id: 'sub-2', endpoint: 'https://b', p256dh: 'p', auth: 'a' },
      ]);
      mockSendNotification.mockResolvedValue({});
      mockPrisma.pushSubscription.update.mockResolvedValue({});

      const result = await sendToUser('user-1', { title: 'Test' });
      expect(result.sent).toBe(2);
      expect(result.failed).toBe(0);
      expect(mockSendNotification).toHaveBeenCalledTimes(2);

      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
    });

    it('elimina suscripciones expiradas (404/410)', async () => {
      process.env.VAPID_PUBLIC_KEY = 'public-key';
      process.env.VAPID_PRIVATE_KEY = 'private-key';
      __resetForTests();

      mockPrisma.pushSubscription.findMany.mockResolvedValue([
        { id: 'sub-ok', endpoint: 'https://ok', p256dh: 'p', auth: 'a' },
        { id: 'sub-expired', endpoint: 'https://expired', p256dh: 'p', auth: 'a' },
      ]);
      mockSendNotification
        .mockResolvedValueOnce({}) // sub-ok
        .mockRejectedValueOnce({ statusCode: 410 }); // sub-expired
      mockPrisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });

      const result = await sendToUser('user-1', { title: 'Test' });
      expect(result.sent).toBe(1);
      expect(result.failed).toBe(1);
      expect(mockPrisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
        where: { id: { in: ['sub-expired'] } },
      });

      delete process.env.VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;
    });
  });

  describe('getPublicVapidKey()', () => {
    it('devuelve null si VAPID no está configurado', () => {
      expect(getPublicVapidKey()).toBeNull();
    });

    it('devuelve la clave pública cuando está configurada', () => {
      process.env.VAPID_PUBLIC_KEY = 'public-key-123';
      expect(getPublicVapidKey()).toBe('public-key-123');
      delete process.env.VAPID_PUBLIC_KEY;
    });
  });
});
