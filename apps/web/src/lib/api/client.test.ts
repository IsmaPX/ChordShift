/**
 * Tests del cliente HTTP.
 * Mock de fetch global.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiError } from '../client';
import { tokenStore } from '../tokenStore';

const MOCK_URL = 'http://localhost:3001';

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    tokenStore.clear();
    // Forzar la URL de testing
    (import.meta.env as { VITE_API_URL?: string }).VITE_API_URL = MOCK_URL;
  });

  it('GET añade Authorization header cuando hay token', async () => {
    tokenStore.setAuth('test-token', { id: 'u1', email: 'a@b.com', displayName: null });

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/api/test');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer test-token');
  });

  it('GET omite Authorization cuando no hay token', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/api/test');

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBeUndefined();
  });

  it('GET serializa query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.get('/api/songs', { query: { search: 'worship', limit: 10, tab: 'all' } });

    const calledUrl = fetchMock.mock.calls[0][0] as string;
    expect(calledUrl).toContain('search=worship');
    expect(calledUrl).toContain('limit=10');
    expect(calledUrl).toContain('tab=all');
  });

  it('POST envía body como JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 201 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await apiClient.post('/api/test', { name: 'foo' });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ name: 'foo' });
  });

  it('lanza ApiError tipado en 4xx', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: 'No autorizado', code: 'UNAUTHORIZED' }),
          { status: 401 },
        ),
      ),
    );

    await expect(apiClient.get('/api/x')).rejects.toBeInstanceOf(ApiError);
    await expect(apiClient.get('/api/x')).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
  });

  it('lanza ApiError de red cuando fetch falla', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    try {
      await apiClient.get('/api/x');
      expect.fail('debería haber lanzado');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(0);
      expect((err as ApiError).code).toBe('NETWORK_ERROR');
    }
  });

  it('respeta AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError')));

    await expect(apiClient.get('/api/x', { signal: controller.signal })).rejects.toBeInstanceOf(DOMException);
  });
});
