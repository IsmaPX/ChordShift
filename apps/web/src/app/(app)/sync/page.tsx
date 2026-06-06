/**
 * Página de Sync: muestra el estado del outbox y permite forzar sync.
 *
 * Solo visible en modo `api`. Útil para:
 * - QA manual del flujo offline → online
 * - Debug de operaciones pendientes
 * - Borrar el outbox manualmente
 */

import { useEffect, useState } from 'react';
import { RefreshCw, Trash2, Database, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useBackendMode } from '@/hooks/useBackendMode';
import { useSyncStatus, triggerSync } from '@/hooks/useSyncStatus';
import { outboxRepository, type OutboxEntry } from '@/lib/sync/outbox';
import { syncFromServer } from '@/lib/sync/snapshotClient';
import { motion } from 'framer-motion';

export function SyncPage() {
  const { isApi } = useBackendMode();
  const status = useSyncStatus();
  const [entries, setEntries] = useState<OutboxEntry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [snapshotInfo, setSnapshotInfo] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const all = await outboxRepository.getAll();
      setEntries(all);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    if (isApi) {
      void refreshEntries();
    }
  }, [isApi, status.pendingCount]);

  if (!isApi) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Database className="mx-auto mb-4 text-text-secondary" size={48} />
        <h2 className="text-2xl font-semibold mb-2">Sync</h2>
        <p className="text-text-secondary">Requiere modo API activado</p>
      </div>
    );
  }

  const handleFlush = async () => {
    setIsSyncing(true);
    try {
      await triggerSync();
      await refreshEntries();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSnapshot = async () => {
    setSnapshotInfo('Sincronizando desde servidor...');
    try {
      const result = await syncFromServer();
      setSnapshotInfo(`Aplicado: ${result.applied} items · ${result.serverTime}`);
      await refreshEntries();
    } catch (err) {
      setSnapshotInfo(`Error: ${err instanceof Error ? err.message : 'desconocido'}`);
    }
  };

  const handleClear = async () => {
    if (confirm('¿Limpiar todas las operaciones del outbox? Esta acción no se puede deshacer.')) {
      await outboxRepository.clear();
      await refreshEntries();
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      <header>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Database className="text-anime-blue" /> Sync
        </h1>
        <p className="text-text-secondary mt-1">
          Estado de sincronización entre cliente y backend
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-card border border-border rounded-2xl p-4">
          <p className="text-text-secondary text-sm">Conexión</p>
          <p className={`text-xl font-bold ${status.isOnline ? 'text-accent' : 'text-anime-glow'}`}>
            {status.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-4">
          <p className="text-text-secondary text-sm">Pendientes</p>
          <p className="text-xl font-bold">{status.pendingCount}</p>
        </div>
        <div className="bg-bg-card border border-border rounded-2xl p-4">
          <p className="text-text-secondary text-sm">Último sync</p>
          <p className="text-sm font-medium">
            {status.lastSyncAt ? new Date(status.lastSyncAt).toLocaleTimeString() : 'Nunca'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleFlush}
          disabled={isSyncing || status.pendingCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
          Sincronizar ahora
        </button>
        <button
          onClick={handleSnapshot}
          className="flex items-center gap-2 px-4 py-2 bg-anime-blue/20 text-anime-blue rounded-xl hover:bg-anime-blue/30 transition-colors"
        >
          <Database size={16} />
          Traer snapshot del servidor
        </button>
        <button
          onClick={handleClear}
          disabled={entries.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-danger/20 text-danger rounded-xl hover:bg-danger/30 transition-colors disabled:opacity-50"
        >
          <Trash2 size={16} />
          Limpiar outbox
        </button>
      </div>

      {snapshotInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card border border-border rounded-xl p-3 text-sm"
        >
          {snapshotInfo}
        </motion.div>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">Operaciones en el outbox</h2>
        {isLoadingEntries ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-text-secondary text-sm">Sin operaciones</p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="bg-bg-card border border-border rounded-xl p-3 flex items-start gap-3"
              >
                {entry.status === 'applied' ? (
                  <CheckCircle2 className="text-accent flex-shrink-0 mt-0.5" size={18} />
                ) : entry.status === 'rejected' ? (
                  <XCircle className="text-danger flex-shrink-0 mt-0.5" size={18} />
                ) : entry.status === 'syncing' ? (
                  <Loader2 className="animate-spin text-anime-blue flex-shrink-0 mt-0.5" size={18} />
                ) : (
                  <div className="w-[18px] h-[18px] border-2 border-text-secondary rounded-full flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <code className="text-sm font-mono text-accent">{entry.op}</code>
                    <span className="text-xs text-text-secondary">
                      {new Date(entry.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {entry.lastError && (
                    <p className="text-xs text-danger mt-1">{entry.lastError}</p>
                  )}
                  {entry.attempts > 0 && (
                    <p className="text-xs text-text-secondary mt-1">
                      Intentos: {entry.attempts}
                    </p>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.status === 'applied'
                      ? 'bg-accent/20 text-accent'
                      : entry.status === 'rejected'
                        ? 'bg-danger/20 text-danger'
                        : entry.status === 'syncing'
                          ? 'bg-anime-blue/20 text-anime-blue'
                          : 'bg-text-secondary/20 text-text-secondary'
                  }`}
                >
                  {entry.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
