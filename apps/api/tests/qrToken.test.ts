/**
 * Tests del servicio de tokens QR.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/config/database.js', () => ({
  prisma: {
    liveSession: {
      findUnique: vi.fn(),
    },
  },
}));

// Setear env ANTES de los imports
process.env.JWT_SECRET = 'test-secret-que-debe-tener-al-menos-32-caracteres-ok';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import { qrTokenRegistry, QR_TTL_MS } from '../src/services/qrToken.service.js';

describe('qrTokenRegistry', () => {
  beforeEach(() => {
    qrTokenRegistry.__resetForTests();
  });

  it('create() genera un token con URL y expiración', () => {
    const result = qrTokenRegistry.create('sess-1', 'user-1');
    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(20);
    expect(result.url).toContain('/join?qr=');
    expect(result.url).toContain(result.token);
    expect(result.expiresAtMs).toBeGreaterThan(Date.now());
    expect(result.expiresAtMs - Date.now()).toBeLessThanOrEqual(QR_TTL_MS);
  });

  it('redeem() devuelve sessionId y hostId en token válido', () => {
    const { token } = qrTokenRegistry.create('sess-x', 'user-y');
    const result = qrTokenRegistry.redeem(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sessionId).toBe('sess-x');
      expect(result.hostId).toBe('user-y');
    }
  });

  it('redeem() falla con token inexistente', () => {
    const result = qrTokenRegistry.redeem('token-que-no-existe');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/no encontrado/i);
    }
  });

  it('redeem() falla la segunda vez (one-shot)', () => {
    const { token } = qrTokenRegistry.create('sess-1', 'user-1');
    const first = qrTokenRegistry.redeem(token);
    const second = qrTokenRegistry.redeem(token);
    expect(first.ok).toBe(true);
    expect(second.ok).toBe(false);
    if (!second.ok) {
      expect(second.error).toMatch(/ya utilizado/i);
    }
  });

  it('redeem() falla con token expirado', () => {
    const { token } = qrTokenRegistry.create('sess-1', 'user-1');
    // Simular paso del TTL manipulando la entrada
    const entry = (qrTokenRegistry as unknown as { entries: Map<string, { expiresAt: number }> })
      .entries.get(token);
    if (entry) entry.expiresAt = Date.now() - 1000;

    const result = qrTokenRegistry.redeem(token);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/expirado/i);
    }
  });

  it('issueGuestToken() y verifyGuestToken() son simétricos', () => {
    const token = qrTokenRegistry.issueGuestToken('sess-1', 'user-1');
    const payload = qrTokenRegistry.verifyGuestToken(token);
    expect(payload.liveSessionId).toBe('sess-1');
    expect(payload.userId).toBe('user-1');
    expect(payload.email).toMatch(/^guest-/);
  });

  it('verifyGuestToken() rechaza tokens no-guest', async () => {
    const jwt = await import('jsonwebtoken');
    const normalToken = jwt.sign(
      { userId: 'user-1', email: 'a@x.com' },
      process.env.JWT_SECRET!,
    );
    expect(() => qrTokenRegistry.verifyGuestToken(normalToken)).toThrow();
  });

  it('cada create() genera un token único', () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const { token } = qrTokenRegistry.create('sess-1', 'user-1');
      tokens.add(token);
    }
    expect(tokens.size).toBe(50);
  });
});
