/**
 * Tests del SyncManager: ciclo offline → online → flush.
 *
 * Mockeamos:
 * - navigator.onLine + eventos online/offline
 * - apiClient.post para capturar el batch enviado
 * - outboxRepository para no usar IndexedDB real
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { syncManager } from '../syncManager';
import { outboxRepository, type OutboxEntry } from '../outbox';

vi.mock('../outbox', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../outbox')>();
  return {
    ...actual,
    outboxRepository: {
      add: vi.fn().mockResolvedValue('client-id-1'),
      getPending: vi.fn().mockResolvedValue([]),
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn(),
      markSyncing: vi.fn().mockResolvedValue(undefined),
      markApplied: vi.fn().mockResolvedValue(undefined),
      markRejected: vi.fn().mockResolvedValue(undefined),
      recordAttempt: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      countPending: vi.fn().mockResolvedValue(0),
    },
  };
});

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(public status: number, public code: string | undefined, message: string) {
      super(message);
      this.name = 'ApiError';
    }
    static isUnauthorized(err: unknown): boolean {
      return err instanceof Error && (err as { status?: number }).status === 401;
    }
    static isNetworkError(err: unknown): boolean {
      return err instanceof Error && (err as { status?: number }).status === 0;
    }
  },
}));

vi.mock('@/lib/api/tokenStore', () => ({
  tokenStore: {
    getToken: vi.fn().mockReturnValue('test-token'),
    getUser: vi.fn().mockReturnValue({ id: 'u1', email: 'a@b.com' }),
    setAuth: vi.fn(),
    clear: vi.fn(),
    subscribe: vi.fn(),
  },
}));

import { apiClient, ApiError } from '@/lib/api/client';

function makePendingEntry(overrides: Partial<OutboxEntry> = {}): OutboxEntry {
  return {
    id: 'client-id-1',
    op: 'create_song',
    data: { title: 'Test' },
    status: 'pending',
    createdAt: new Date().toISOString(),
    attempts: 0,
    ...overrides,
  };
}

describe('SyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset singleton state via mock reset
    vi.mocked(outboxRepository.getPending).mockResolvedValue([]);
  });

  afterEach(() => {
    syncManager.destroy();
  });

  it('enqueue añade al outbox y dispara flush si online', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    vi.mocked(apiClient.post).mockResolvedValue({
      applied: 0, rejected: 0, errors: 0, results: [],
      serverTime: new Date().toISOString(),
    });

    const id = await syncManager.enqueue('create_song', { title: 'X' });

    expect(id).toBe('client-id-1');
    expect(outboxRepository.add).toHaveBeenCalledWith('create_song', { title: 'X' });
  });

  it('flush procesa pending y emite eventos', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    const entry = makePendingEntry();
    vi.mocked(outboxRepository.getPending).mockResolvedValue([entry]);
    vi.mocked(apiClient.post).mockResolvedValue({
      applied: 1, rejected: 0, errors: 0,
      results: [{ clientId: entry.id, op: entry.op, status: 'applied', serverId: 'server-1' }],
      serverTime: new Date().toISOString(),
    });

    const events: string[] = [];
    syncManager.subscribe((e) => events.push(e.type));

    await syncManager.flush();

    expect(events).toContain('sync_started');
    expect(events).toContain('sync_completed');
    expect(outboxRepository.markApplied).toHaveBeenCalledWith(entry.id, 'server-1');
  });

  it('flush maneja errores de red sin perder ops', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    const entry = makePendingEntry();
    vi.mocked(outboxRepository.getPending).mockResolvedValue([entry]);

    const networkError = new ApiError(0, 'NETWORK_ERROR', 'Network error');
    vi.mocked(apiClient.post).mockRejectedValue(networkError);

    const events: string[] = [];
    syncManager.subscribe((e) => events.push(e.type));

    await syncManager.flush();

    expect(events).toContain('sync_failed');
    expect(outboxRepository.recordAttempt).toHaveBeenCalledWith(entry.id);
  });

  it('flush salta si offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    await syncManager.flush();

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('flush salta si no hay token', async () => {
    const { tokenStore } = await import('@/lib/api/tokenStore');
    vi.mocked(tokenStore.getToken).mockReturnValue(null);

    await syncManager.flush();

    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('flush marca como rejected las ops que exceden max attempts', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    const entry = makePendingEntry({ attempts: 5 });
    vi.mocked(outboxRepository.getPending).mockResolvedValue([entry]);
    vi.mocked(apiClient.post).mockResolvedValue({
      applied: 0, rejected: 0, errors: 0, results: [],
      serverTime: new Date().toISOString(),
    });

    await syncManager.flush();

    expect(outboxRepository.markRejected).toHaveBeenCalledWith(entry.id, 'Max attempts reached');
    expect(apiClient.post).not.toHaveBeenCalled();
  });

  it('flush es idempotente (segunda llamada espera la primera)', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    let resolvePost: (value: unknown) => void;
    const postPromise = new Promise((resolve) => { resolvePost = resolve; });
    vi.mocked(apiClient.post).mockReturnValue(postPromise as never);

    vi.mocked(outboxRepository.getPending).mockResolvedValue([makePendingEntry()]);

    const p1 = syncManager.flush();
    const p2 = syncManager.flush();
    const p3 = syncManager.flush();

    // Solo debería haberse llamado una vez
    expect(apiClient.post).toHaveBeenCalledTimes(1);

    // Resolver el batch
    resolvePost!({
      applied: 1, rejected: 0, errors: 0,
      results: [{ clientId: 'client-id-1', op: 'create_song', status: 'applied', serverId: 's1' }],
      serverTime: new Date().toISOString(),
    });

    await Promise.all([p1, p2, p3]);
  });
});
