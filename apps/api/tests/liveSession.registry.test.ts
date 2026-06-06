/**
 * Tests de la registry de sesiones en vivo.
 *
 * La registry es el corazón del sistema: el estado en tiempo real
 * (participantes, beats, TTL) vive aquí. Es por tanto lo más crítico
 * de testear sin levantar un servidor HTTP completo.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { liveSessionRegistry } from '../src/sockets/liveSession.registry.js';

describe('liveSessionRegistry', () => {
  beforeEach(() => {
    liveSessionRegistry.__resetForTests();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const baseState = {
    sessionId: 'sess-1',
    hostId: 'user-host',
    songId: 'song-1',
    status: 'active' as const,
    currentBeat: 0,
    bpm: 120,
    startedAtMs: Date.now(),
  };

  const alice = { id: 'u-alice', email: 'a@x.com', displayName: 'Alice' };
  const bob = { id: 'u-bob', email: 'b@x.com', displayName: 'Bob' };

  it('crea una sesión y la recupera', () => {
    const created = liveSessionRegistry.create(baseState);
    expect(created.sessionId).toBe('sess-1');
    expect(created.participants).toEqual([]);

    const fetched = liveSessionRegistry.get('sess-1');
    expect(fetched).toBeDefined();
    expect(fetched?.bpm).toBe(120);
  });

  it('añade participantes al hacer join', () => {
    liveSessionRegistry.create(baseState);

    const state1 = liveSessionRegistry.join('sess-1', 'socket-1', alice);
    expect(state1?.participants).toHaveLength(1);
    expect(state1?.participants[0]).toEqual(alice);

    const state2 = liveSessionRegistry.join('sess-1', 'socket-2', bob);
    expect(state2?.participants).toHaveLength(2);
  });

  it('no duplica participantes en reconexiones', () => {
    liveSessionRegistry.create(baseState);
    liveSessionRegistry.join('sess-1', 'socket-1', alice);
    liveSessionRegistry.join('sess-1', 'socket-1b', alice); // Mismo user, otro socket
    const state = liveSessionRegistry.join('sess-1', 'socket-2', alice);
    expect(state?.participants).toHaveLength(1);
  });

  it('actualiza el beat y devuelve timestamp', () => {
    liveSessionRegistry.create(baseState);
    const beat = liveSessionRegistry.updateBeat('sess-1', 42);
    expect(beat).toBeDefined();
    expect(beat?.beat).toBe(42);
    expect(beat?.emittedAtMs).toBeGreaterThan(0);
    expect(liveSessionRegistry.get('sess-1')?.currentBeat).toBe(42);
  });

  it('sólo el host puede pausar', () => {
    liveSessionRegistry.create(baseState);
    const r1 = liveSessionRegistry.pause('sess-1', 'intruso');
    expect(r1.ok).toBe(false);
    const r2 = liveSessionRegistry.pause('sess-1', 'user-host');
    expect(r2.ok).toBe(true);
    expect(liveSessionRegistry.get('sess-1')?.status).toBe('paused');
  });

  it('sólo el host puede reanudar', () => {
    liveSessionRegistry.create(baseState);
    liveSessionRegistry.pause('sess-1', 'user-host');
    const r1 = liveSessionRegistry.resume('sess-1', 'intruso');
    expect(r1.ok).toBe(false);
    const r2 = liveSessionRegistry.resume('sess-1', 'user-host');
    expect(r2.ok).toBe(true);
    expect(liveSessionRegistry.get('sess-1')?.status).toBe('active');
  });

  it('end purga la sesión', () => {
    liveSessionRegistry.create(baseState);
    const r = liveSessionRegistry.end('sess-1', 'user-host');
    expect(r.ok).toBe(true);
    expect(liveSessionRegistry.get('sess-1')).toBeUndefined();
    expect(liveSessionRegistry.exists('sess-1')).toBe(false);
  });

  it('devuelve error al pausar sesión inexistente', () => {
    const r = liveSessionRegistry.pause('no-existe', 'user-host');
    expect(r.ok).toBe(false);
    expect(r.error).toBeDefined();
  });

  it('purga automáticamente por TTL si hay inactividad', () => {
    // Espiar setTimeout para usar uno con TTL corto
    const realSetTimeout = globalThis.setTimeout;
    const realClearTimeout = globalThis.clearTimeout;

    // Crear la sesión con TTL custom (manipulando el spy)
    const sessionId = 'sess-ttl';
    const shortTimer = vi.fn((fn: () => void, ms: number) => {
      // Sólo interceptamos timers de 1h (el TTL por defecto)
      if (ms === 60 * 60 * 1000) {
        return realSetTimeout(fn, 50);
      }
      return realSetTimeout(fn, ms);
    }) as unknown as typeof setTimeout;
    globalThis.setTimeout = shortTimer as unknown as typeof setTimeout;

    liveSessionRegistry.create({ ...baseState, sessionId });
    expect(liveSessionRegistry.exists(sessionId)).toBe(true);

    // Esperar 100ms reales para que el timer corto dispare
    return new Promise<void>(resolve => {
      realSetTimeout(() => {
        expect(liveSessionRegistry.exists(sessionId)).toBe(false);
        globalThis.setTimeout = realSetTimeout;
        globalThis.clearTimeout = realClearTimeout;
        resolve();
      }, 100);
    });
  });

  describe('lifecycle hooks', () => {
    it('emite "created" al crear una sesión', () => {
      const listener = vi.fn();
      const unsubscribe = liveSessionRegistry.onLifecycle(listener);
      liveSessionRegistry.create({ ...baseState, sessionId: 'lifecycle-1' });
      expect(listener).toHaveBeenCalledWith({ type: 'created', sessionId: 'lifecycle-1' });
      unsubscribe();
    });

    it('emite "ended" con reason "host" al finalizar manualmente', () => {
      const listener = vi.fn();
      liveSessionRegistry.create({ ...baseState, sessionId: 'lifecycle-2' });
      const unsubscribe = liveSessionRegistry.onLifecycle(listener);
      liveSessionRegistry.end('lifecycle-2', 'user-host');
      expect(listener).toHaveBeenCalledWith({ type: 'ended', sessionId: 'lifecycle-2', reason: 'host' });
      unsubscribe();
    });

    it('emite "ended" con reason "ttl" al purgar por timeout', () => {
      const realSetTimeout = globalThis.setTimeout;
      const sessionId = 'lifecycle-ttl';
      const shortTimer = ((fn: () => void, ms: number) => {
        if (ms === 60 * 60 * 1000) return realSetTimeout(fn, 30);
        return realSetTimeout(fn, ms);
      }) as unknown as typeof setTimeout;
      globalThis.setTimeout = shortTimer;

      const listener = vi.fn();
      const unsubscribe = liveSessionRegistry.onLifecycle(listener);
      liveSessionRegistry.create({ ...baseState, sessionId });

      return new Promise<void>(resolve => {
        realSetTimeout(() => {
          expect(listener).toHaveBeenCalledWith({ type: 'ended', sessionId, reason: 'ttl' });
          globalThis.setTimeout = realSetTimeout;
          unsubscribe();
          resolve();
        }, 80);
      });
    });

    it('NO emite "ended" si la sesión no existía (purge idempotente)', () => {
      const listener = vi.fn();
      const unsubscribe = liveSessionRegistry.onLifecycle(listener);
      // Llamar a purge indirectamente: el método end con sesión inexistente no emite
      const result = liveSessionRegistry.end('no-existe', 'user-host');
      expect(result.ok).toBe(false);
      expect(listener).not.toHaveBeenCalled();
      unsubscribe();
    });

    it('los errores en listeners no rompen el flujo', () => {
      const badListener = vi.fn(() => {
        throw new Error('boom');
      });
      const goodListener = vi.fn();
      liveSessionRegistry.onLifecycle(badListener);
      liveSessionRegistry.onLifecycle(goodListener);

      // No debe lanzar
      expect(() => liveSessionRegistry.create({ ...baseState, sessionId: 'lifecycle-err' })).not.toThrow();
      expect(goodListener).toHaveBeenCalled();
    });

    it('la función de unsubscribe funciona', () => {
      const listener = vi.fn();
      const unsubscribe = liveSessionRegistry.onLifecycle(listener);
      unsubscribe();
      liveSessionRegistry.create({ ...baseState, sessionId: 'lifecycle-unsub' });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('list()', () => {
    it('devuelve todas las sesiones activas', () => {
      liveSessionRegistry.create({ ...baseState, sessionId: 'list-1' });
      liveSessionRegistry.create({ ...baseState, sessionId: 'list-2' });
      const all = liveSessionRegistry.list();
      expect(all).toHaveLength(2);
      expect(all.map(s => s.sessionId).sort()).toEqual(['list-1', 'list-2']);
    });

    it('devuelve array vacío si no hay sesiones', () => {
      expect(liveSessionRegistry.list()).toEqual([]);
    });
  });
});
