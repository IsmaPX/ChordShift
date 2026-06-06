/**
 * Tests del outbox: persistencia y transiciones de estado.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { outboxRepository, outboxDb } from '../outbox';

describe('outboxRepository', () => {
  beforeEach(async () => {
    await outboxDb.outbox.clear();
  });

  it('add crea una entrada con estado pending', async () => {
    const id = await outboxRepository.add('create_song', { title: 'Foo' });
    const entry = await outboxRepository.getById(id);
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('pending');
    expect(entry?.op).toBe('create_song');
    expect(entry?.attempts).toBe(0);
  });

  it('getPending devuelve solo las pendientes o rechazadas', async () => {
    const id1 = await outboxRepository.add('create_song', { title: 'A' });
    const id2 = await outboxRepository.add('delete_song', { id: 'x' });
    await outboxRepository.markApplied(id1, 'server-id-1');

    const pending = await outboxRepository.getPending();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe(id2);
  });

  it('markSyncing actualiza el estado de múltiples entradas', async () => {
    const id1 = await outboxRepository.add('create_song', { x: 1 });
    const id2 = await outboxRepository.add('create_song', { x: 2 });
    await outboxRepository.markSyncing([id1, id2]);

    const entries = await outboxRepository.getAll();
    expect(entries.every((e) => e.status === 'syncing')).toBe(true);
  });

  it('markApplied asigna serverId y timestamp', async () => {
    const id = await outboxRepository.add('create_song', { x: 1 });
    await outboxRepository.markApplied(id, 'server-123');

    const entry = await outboxRepository.getById(id);
    expect(entry?.status).toBe('applied');
    expect(entry?.serverId).toBe('server-123');
    expect(entry?.appliedAt).toBeDefined();
  });

  it('markRejected incrementa attempts y guarda error', async () => {
    const id = await outboxRepository.add('create_song', { x: 1 });
    await outboxRepository.markRejected(id, 'Network error');

    const entry = await outboxRepository.getById(id);
    expect(entry?.status).toBe('rejected');
    expect(entry?.attempts).toBe(1);
    expect(entry?.lastError).toBe('Network error');
  });

  it('recordAttempt resetea a pending e incrementa attempts', async () => {
    const id = await outboxRepository.add('create_song', { x: 1 });
    await outboxRepository.markRejected(id, 'Error');
    await outboxRepository.recordAttempt(id);

    const entry = await outboxRepository.getById(id);
    expect(entry?.status).toBe('pending');
    expect(entry?.attempts).toBe(2);
  });

  it('countPending cuenta solo pending + rejected', async () => {
    const id1 = await outboxRepository.add('create_song', { x: 1 });
    const id2 = await outboxRepository.add('create_song', { x: 2 });
    await outboxRepository.markApplied(id1, 's1');

    expect(await outboxRepository.countPending()).toBe(1);
    await outboxRepository.markRejected(id2, 'err');
    expect(await outboxRepository.countPending()).toBe(2);
  });
});
