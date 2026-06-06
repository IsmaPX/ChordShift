/**
 * Tests del token store.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { tokenStore } from '../tokenStore';

describe('tokenStore', () => {
  beforeEach(() => {
    tokenStore.clear();
    localStorage.clear();
  });

  it('setAuth persiste token y user', () => {
    tokenStore.setAuth('jwt-abc', { id: 'u1', email: 'a@b.com', displayName: 'Alice' });

    expect(tokenStore.getToken()).toBe('jwt-abc');
    expect(tokenStore.getUser()).toEqual({ id: 'u1', email: 'a@b.com', displayName: 'Alice' });
    expect(localStorage.getItem('worship_piano_jwt_token')).toBe('jwt-abc');
  });

  it('clear remueve token y user', () => {
    tokenStore.setAuth('jwt-abc', { id: 'u1', email: 'a@b.com', displayName: null });
    tokenStore.clear();

    expect(tokenStore.getToken()).toBeNull();
    expect(tokenStore.getUser()).toBeNull();
    expect(localStorage.getItem('worship_piano_jwt_token')).toBeNull();
  });

  it('getToken lee de localStorage en el primer acceso', () => {
    localStorage.setItem('worship_piano_jwt_token', 'persisted-token');
    // Forzar reset del cache creando nueva instancia no es posible (singleton),
    // pero podemos usar un fresh access pattern: el store ya leyó, simulamos otro escenario.
    tokenStore.clear();
    localStorage.setItem('worship_piano_jwt_token', 'persisted-token');
    expect(tokenStore.getToken()).toBe('persisted-token');
  });

  it('notify a listeners en cambios', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);

    tokenStore.setAuth('tok', { id: '1', email: 'a@b.com', displayName: null });
    expect(listener).toHaveBeenCalledTimes(1);

    tokenStore.clear();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    tokenStore.setAuth('tok2', { id: '2', email: 'c@d.com', displayName: null });
    expect(listener).toHaveBeenCalledTimes(2); // no más notificaciones
  });
});

// Helper para vi.fn
import { vi } from 'vitest';
