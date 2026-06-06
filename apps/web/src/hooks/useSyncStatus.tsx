/**
 * Hook React: estado de sincronización para la UI.
 *
 * Muestra:
 * - Si estamos online
 * - Cuántas operaciones hay pendientes
 * - Si hay un sync en curso
 *
 * Útil para badges/indicadores en la UI.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import { syncManager, type SyncEvent } from '@/lib/sync/syncManager';
import { outboxRepository } from '@/lib/sync/outbox';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastEvent: SyncEvent | null;
  lastSyncAt: string | null;
}

const initialStatus: SyncStatus = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  isSyncing: false,
  pendingCount: 0,
  lastEvent: null,
  lastSyncAt: null,
};

let cachedStatus: SyncStatus = initialStatus;
const statusListeners = new Set<() => void>();

function setStatus(updater: (prev: SyncStatus) => SyncStatus): void {
  cachedStatus = updater(cachedStatus);
  for (const listener of statusListeners) listener();
}

function subscribe(listener: () => void): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

function getSnapshot(): SyncStatus {
  return cachedStatus;
}

// Inicialización idempotente
let initStarted = false;
function ensureInitialized(): void {
  if (initStarted) return;
  initStarted = true;

  // Wire syncManager events to status
  syncManager.subscribe((event) => {
    if (event.type === 'online_detected') {
      setStatus((prev) => ({ ...prev, isOnline: true }));
    } else if (event.type === 'offline_detected') {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    } else if (event.type === 'sync_started') {
      setStatus((prev) => ({
        ...prev,
        isSyncing: true,
        lastEvent: event,
      }));
    } else if (event.type === 'sync_completed') {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastEvent: event,
        lastSyncAt: event.timestamp,
      }));
      void refreshPendingCount();
    } else if (event.type === 'sync_failed') {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
        lastEvent: event,
      }));
    }
  });

  // Sincronizar pending count inicial
  void refreshPendingCount();

  // Polling ligero como fallback (cada 30s)
  if (typeof window !== 'undefined') {
    window.setInterval(() => {
      void refreshPendingCount();
    }, 30_000);
  }
}

async function refreshPendingCount(): Promise<void> {
  try {
    const count = await outboxRepository.countPending();
    setStatus((prev) => (prev.pendingCount === count ? prev : { ...prev, pendingCount: count }));
  } catch {
    // Ignore — Dexie might not be available
  }
}

export function useSyncStatus(): SyncStatus {
  ensureInitialized();

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Componente pequeño: badge de sync status.
 * Reutilizable en headers/footers para mostrar online/offline/pending.
 */
export function SyncStatusBadge() {
  const status = useSyncStatus();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (status.isSyncing) {
    return (
      <div className="flex items-center gap-2 text-xs text-anime-blue">
        <span className="inline-block w-2 h-2 bg-anime-blue rounded-full animate-pulse" />
        Sincronizando...
      </div>
    );
  }

  if (!status.isOnline) {
    return (
      <div className="flex items-center gap-2 text-xs text-anime-glow">
        <span className="inline-block w-2 h-2 bg-anime-glow rounded-full" />
        Sin conexión
        {status.pendingCount > 0 && (
          <span className="text-text-secondary">({status.pendingCount} pendientes)</span>
        )}
      </div>
    );
  }

  if (status.pendingCount > 0) {
    return (
      <button
        onClick={() => syncManager.flush()}
        className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent transition-colors"
        title="Click para sincronizar ahora"
      >
        <span className="inline-block w-2 h-2 bg-anime-glow rounded-full" />
        {status.pendingCount} {status.pendingCount === 1 ? 'pendiente' : 'pendientes'}
      </button>
    );
  }

  if (!isMobile) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-secondary">
        <span className="inline-block w-2 h-2 bg-accent rounded-full" />
        Sincronizado
      </div>
    );
  }

  return null;
}

/**
 * Helper para forzar sync manualmente.
 */
export function triggerSync(): Promise<void> {
  return syncManager.flush();
}
