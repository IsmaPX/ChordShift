/**
 * Tests del storage service (factory + interface).
 *
 * En local mode, verificamos el comportamiento del filesystem.
 * Para S3/Supabase, los tests requieren credenciales reales y se
 * recomienda hacer tests de integración separados.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { storage } from '../src/services/storage.service.js';

describe('storage service (local)', () => {
  let originalCwd: string;

  beforeEach(async () => {
    // Cambiar el cwd a un tempdir para no contaminar el proyecto
    originalCwd = process.cwd();
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
    process.chdir(tmpDir);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
  });

  it('save() guarda el archivo y devuelve key/url/size', async () => {
    const buffer = Buffer.from('fake audio data');
    const result = await storage.save(buffer, 'test.mp3', 'audio/mpeg');

    expect(result.key).toMatch(/\.mp3$/);
    expect(result.url).toContain(result.key);
    expect(result.size).toBe(buffer.length);

    // Verificar que el archivo existe
    const exists = await storage.exists(result.key);
    expect(exists).toBe(true);
  });

  it('read() recupera el contenido exacto', async () => {
    const buffer = Buffer.from('hello world');
    const result = await storage.save(buffer, 'test.txt', 'audio/mpeg');
    const read = await storage.read(result.key);
    expect(read.toString()).toBe('hello world');
  });

  it('save() infiere extensión desde mime type si no la tiene', async () => {
    const buffer = Buffer.from('wav data');
    const result = await storage.save(buffer, 'no-ext', 'audio/wav');
    expect(result.key).toMatch(/\.wav$/);
  });

  it('delete() elimina el archivo', async () => {
    const buffer = Buffer.from('x');
    const result = await storage.save(buffer, 'test.mp3', 'audio/mpeg');
    expect(await storage.exists(result.key)).toBe(true);

    await storage.delete(result.key);
    expect(await storage.exists(result.key)).toBe(false);
  });

  it('delete() es idempotente (no falla si no existe)', async () => {
    await expect(storage.delete('nope.mp3')).resolves.not.toThrow();
  });

  it('read() rechaza keys con path traversal', async () => {
    await expect(storage.read('../../../etc/passwd')).rejects.toThrow(/invalid key/i);
    await expect(storage.read('foo/bar.mp3')).rejects.toThrow(/invalid key/i);
    await expect(storage.read('foo\\bar.mp3')).rejects.toThrow(/invalid key/i);
  });

  it('exists() devuelve false para keys inválidas', async () => {
    expect(await storage.exists('../../etc/passwd')).toBe(false);
    expect(await storage.exists('a/b')).toBe(false);
  });

  it('getUrl() devuelve una URL válida', () => {
    const url = storage.getUrl('abc.mp3');
    expect(url).toMatch(/^https?:\/\//);
    expect(url).toContain('abc.mp3');
  });
});
