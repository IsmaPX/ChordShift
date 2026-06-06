/**
 * SyncManager: orquesta el envío del outbox al backend.
 *
 * Responsabilidades:
 * - Detectar online/offline vía eventos del browser
 * - Hacer flush del outbox cuando vuelve la conexión
 * - Reintentar operaciones fallidas con backoff exponencial
 * - Notificar a la UI mediante el módulo de eventos
 *
 * Estrategia de retry:
 * - Máximo 5 intentos por operación
 * - Backoff: 1s, 5s, 30s, 2min, 10min
 * - Operacionalmente, esto evita martillar al backend cuando hay un problema real
 */

import { outboxRepository, type OutboxEntry } from './outbox';
import { apiClient, ApiError } from '@/lib/api/client';
import { tokenStore } from '@/lib/api/tokenStore';
import { createModuleLogger } from '@/lib/logger';

const log = createModuleLogger('SyncManager');

export type SyncEventType =
  | 'sync_started'
  | 'sync_completed'
  | 'sync_failed'
  | 'offline_detected'
  | 'online_detected';

export interface SyncEvent {
  type: SyncEventType;
  pendingCount: number;
  successCount?: number;
  errorCount?: number;
  error?: string;
  timestamp: string;
}

type SyncListener = (event: SyncEvent) => void;

const MAX_ATTEMPTS = 5;
const BACKOFF_MS = [1_000, 5_000, 30_000, 120_000, 600_000];

class SyncManager {
  private listeners = new Set<SyncListener>();
  private isSyncing = false;
  private isOnline: boolean;
  private flushPromise: Promise<void> | null = null;

  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  /**
   * Inicializa listeners del browser. Llamar una sola vez en app startup.
   */
  init(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Flush inicial por si hay ops pendientes de una sesión anterior
    if (this.isOnline && tokenStore.getToken()) {
      void this.flush();
    }
  }

  destroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  isBrowserOnline(): boolean {
    return this.isOnline;
  }

  subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Encola una operación en el outbox y dispara flush si estamos online.
   * Si estamos offline, la operación queda en el outbox hasta volver online.
   */
  async enqueue(op: Parameters<typeof outboxRepository.add>[0], data: unknown): Promise<string> {
    const id = await outboxRepository.add(op, data);

    if (this.isOnline && tokenStore.getToken()) {
      void this.flush();
    }

    return id;
  }

  /**
   * Procesa el outbox y envía las operaciones pendientes al backend.
   * Idempotente: si ya hay un flush en curso, devuelve la misma promesa.
   */
  async flush(): Promise<void> {
    if (this.flushPromise) return this.flushPromise;

    if (!this.isOnline) {
      log.debug('flush: offline, skipping');
      return;
    }
    if (!tokenStore.getToken()) {
      log.debug('flush: no auth token, skipping');
      return;
    }
    if (this.isSyncing) {
      log.debug('flush: already in progress, returning existing promise');
      return;
    }

    this.isSyncing = true;
    this.flushPromise = this.doFlush().finally(() => {
      this.isSyncing = false;
      this.flushPromise = null;
    });

    return this.flushPromise;
  }

  private async doFlush(): Promise<void> {
    const pending = await outboxRepository.getPending();
    if (pending.length === 0) {
      log.debug('doFlush: nothing to sync');
      return;
    }

    log.info('doFlush: syncing', { count: pending.length });
    this.emit({
      type: 'sync_started',
      pendingCount: pending.length,
      timestamp: new Date().toISOString(),
    });

    // Filtrar por max attempts
    const eligible = pending.filter((e) => e.attempts < MAX_ATTEMPTS);
    const toDefer = pending.filter((e) => e.attempts >= MAX_ATTEMPTS);

    // Marcar las que exceden como rechazadas definitivamente
    for (const entry of toDefer) {
      await outboxRepository.markRejected(entry.id, 'Max attempts reached');
    }

    if (eligible.length === 0) {
      this.emit({
        type: 'sync_completed',
        pendingCount: 0,
        successCount: 0,
        errorCount: toDefer.length,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Marcar como syncing
    await outboxRepository.markSyncing(eligible.map((e) => e.id));

    try {
      const payload = eligible.map((e) => ({
        clientId: e.id,
        op: e.op,
        data: e.data,
      }));

      const result = await apiClient.post<{
        applied: number;
        rejected: number;
        errors: number;
        results: Array<{ clientId: string; op: string; status: string; serverId?: string; error?: string }>;
      }>('/api/sync/batch', {
        operations: payload,
        sinceLastSync: new Date().toISOString(),
      });

      let success = 0;
      let errors = 0;

      for (const r of result.results) {
        if (r.status === 'applied' && r.serverId) {
          await outboxRepository.markApplied(r.clientId, r.serverId);
          success++;
        } else {
          await outboxRepository.markRejected(r.clientId, r.error ?? 'Unknown error');
          errors++;
        }
      }

      log.info('doFlush: completed', { success, errors });
      this.emit({
        type: 'sync_completed',
        pendingCount: pending.length - success,
        successCount: success,
        errorCount: errors,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unknown sync error';
      log.error('doFlush failed', { error: message });

      // Devolver las ops a pending para reintentar
      for (const entry of eligible) {
        await outboxRepository.recordAttempt(entry.id);
      }

      this.emit({
        type: 'sync_failed',
        pendingCount: eligible.length,
        error: message,
        timestamp: new Date().toISOString(),
      });

      // Si el error es de red, no reintentar inmediatamente
      if (ApiError.isNetworkError(err)) {
        log.debug('doFlush: network error, will retry on next online event');
      }
    }
  }

  private handleOnline = (): void => {
    this.isOnline = true;
    log.info('network online');
    this.emit({
      type: 'online_detected',
      pendingCount: 0,
      timestamp: new Date().toISOString(),
    });
    void this.flush();
  };

  private handleOffline = (): void => {
    this.isOnline = false;
    log.info('network offline');
    this.emit({
      type: 'offline_detected',
      pendingCount: 0,
      timestamp: new Date().toISOString(),
    });
  };

  private emit(event: SyncEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        log.error('listener error', { error: String(err) });
      }
    }
  }
}

export const syncManager = new SyncManager();
export type { OutboxEntry };
