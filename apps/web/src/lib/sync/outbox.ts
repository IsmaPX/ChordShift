/**
 * Outbox persistente para operaciones offline.
 *
 * Almacena operaciones en IndexedDB (Dexie) cuando el cliente está offline.
 * El sync manager las consume cuando recupera conexión.
 *
 * Estructura por operación:
 * - clientId: UUID generado por el cliente para reconciliación
 * - op: nombre de la operación
 * - data: payload
 * - createdAt: timestamp de creación
 * - status: pending | syncing | applied | rejected
 * - attempts: número de intentos
 * - lastError: mensaje del último fallo
 */

import Dexie, { type Table } from 'dexie';

export type OutboxOpName =
  | 'create_song'
  | 'delete_song'
  | 'create_session'
  | 'create_ear_training'
  | 'add_xp'
  | 'update_settings';

export type OutboxStatus = 'pending' | 'syncing' | 'applied' | 'rejected';

export interface OutboxEntry {
  id: string;                  // clientId
  op: OutboxOpName;
  data: unknown;               // payload específico de la operación
  status: OutboxStatus;
  createdAt: string;
  attempts: number;
  lastError?: string;
  serverId?: string;           // ID asignado por el backend
  appliedAt?: string;
}

class OutboxDatabase extends Dexie {
  outbox!: Table<OutboxEntry, string>;

  constructor() {
    super('WorshipPianoOutbox');
    this.version(1).stores({
      outbox: 'id, status, createdAt, op',
    });
  }
}

const outboxDb = new OutboxDatabase();

export const outboxRepository = {
  async add(op: OutboxOpName, data: unknown): Promise<string> {
    const id = crypto.randomUUID();
    await outboxDb.outbox.add({
      id,
      op,
      data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      attempts: 0,
    });
    return id;
  },

  async getPending(): Promise<OutboxEntry[]> {
    return outboxDb.outbox
      .where('status')
      .anyOf('pending', 'rejected')
      .sortBy('createdAt');
  },

  async getAll(): Promise<OutboxEntry[]> {
    return outboxDb.outbox.orderBy('createdAt').reverse().toArray();
  },

  async getById(id: string): Promise<OutboxEntry | undefined> {
    return outboxDb.outbox.get(id);
  },

  async markSyncing(ids: string[]): Promise<void> {
    await outboxDb.outbox
      .where('id')
      .anyOf(ids)
      .modify((entry: OutboxEntry) => {
        entry.status = 'syncing';
      });
  },

  async markApplied(id: string, serverId: string): Promise<void> {
    await outboxDb.outbox.update(id, {
      status: 'applied',
      serverId,
      appliedAt: new Date().toISOString(),
    });
  },

  async markRejected(id: string, error: string): Promise<void> {
    await outboxDb.outbox
      .where('id')
      .equals(id)
      .modify((entry: OutboxEntry) => {
        entry.status = 'rejected';
        entry.attempts += 1;
        entry.lastError = error;
      });
  },

  async recordAttempt(id: string): Promise<void> {
    await outboxDb.outbox
      .where('id')
      .equals(id)
      .modify((entry: OutboxEntry) => {
        entry.attempts += 1;
        entry.status = 'pending';
      });
  },

  async clear(): Promise<void> {
    await outboxDb.outbox.clear();
  },

  async countPending(): Promise<number> {
    return outboxDb.outbox
      .where('status')
      .anyOf('pending', 'rejected')
      .count();
  },
};

// Re-export del tipo para los tests
export type { OutboxEntry };

// Singleton db para tests
export { outboxDb };
