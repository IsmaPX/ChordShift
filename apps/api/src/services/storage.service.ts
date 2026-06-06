/**
 * Storage de archivos (audios de canciones).
 *
 * Backends soportados via `STORAGE_DRIVER`:
 * - `local` (default): filesystem local en `STORAGE_DIR`
 * - `s3`:            AWS S3 o compatible (MinIO, R2, etc)
 * - `supabase`:     Supabase Storage
 *
 * El driver se selecciona en runtime según la variable de entorno,
 * pero la interfaz `StorageProvider` es la misma. Esto permite
 * cambiar de backend sin tocar el resto de la app.
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { env } from '../config/env.js';

export interface StorageProvider {
  save(buffer: Buffer, originalName: string, mimeType: string): Promise<{ key: string; url: string; size: number }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
  exists(key: string): Promise<boolean>;
  read(key: string): Promise<Buffer>;
}

const STORAGE_DIR = path.resolve(process.cwd(), 'storage');

class LocalStorageProvider implements StorageProvider {
  async save(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ key: string; url: string; size: number }> {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    const ext = path.extname(originalName) || mimeToExt(mimeType);
    const key = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(STORAGE_DIR, key);
    await fs.writeFile(filePath, buffer);
    return { key, url: this.getUrl(key), size: buffer.length };
  }

  async delete(key: string): Promise<void> {
    if (key.includes('..') || key.includes('/') || key.includes('\\')) {
      throw new Error('Invalid key');
    }
    const filePath = path.join(STORAGE_DIR, key);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  getUrl(key: string): string {
    return `${env.CORS_ORIGIN.split(',')[0]}/storage/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    if (key.includes('..') || key.includes('/') || key.includes('\\')) return false;
    try {
      await fs.access(path.join(STORAGE_DIR, key));
      return true;
    } catch {
      return false;
    }
  }

  async read(key: string): Promise<Buffer> {
    if (key.includes('..') || key.includes('/') || key.includes('\\')) {
      throw new Error('Invalid key');
    }
    return fs.readFile(path.join(STORAGE_DIR, key));
  }
}

/**
 * Provider para S3 y compatibles (MinIO, Cloudflare R2, Backblaze B2, etc).
 *
 * Usa el SDK oficial `aws-sdk` v3. Se carga lazy para no penalizar
 * el arranque si no se usa.
 */
class S3StorageProvider implements StorageProvider {
  private clientPromise: Promise<{
    client: import('@aws-sdk/client-s3').S3Client;
    PutObjectCommand: typeof import('@aws-sdk/client-s3').PutObjectCommand;
    DeleteObjectCommand: typeof import('@aws-sdk/client-s3').DeleteObjectCommand;
    GetObjectCommand: typeof import('@aws-sdk/client-s3').GetObjectCommand;
    HeadObjectCommand: typeof import('@aws-sdk/client-s3').HeadObjectCommand;
  }> | null = null;

  private async getClient() {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } =
          await import('@aws-sdk/client-s3');
        if (!env.S3_BUCKET) {
          throw new Error('S3_BUCKET requerido cuando STORAGE_DRIVER=s3');
        }
        const client = new S3Client({
          region: env.S3_REGION ?? 'us-east-1',
          endpoint: env.S3_ENDPOINT, // Para MinIO/R2
          credentials: env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
            ? {
                accessKeyId: env.S3_ACCESS_KEY_ID,
                secretAccessKey: env.S3_SECRET_ACCESS_KEY,
              }
            : undefined, // IAM role
          forcePathStyle: !!env.S3_ENDPOINT, // Necesario para MinIO
        });
        return { client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand };
      })();
    }
    return this.clientPromise;
  }

  async save(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ key: string; url: string; size: number }> {
    const { client, PutObjectCommand } = await this.getClient();
    const ext = path.extname(originalName) || mimeToExt(mimeType);
    const key = `${crypto.randomUUID()}${ext}`;

    await client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: env.S3_PUBLIC ? 'public-read' : undefined,
      }),
    );

    return { key, url: this.getUrl(key), size: buffer.length };
  }

  async delete(key: string): Promise<void> {
    const { client, DeleteObjectCommand } = await this.getClient();
    if (key.includes('..')) throw new Error('Invalid key');
    await client.send(
      new DeleteObjectCommand({ Bucket: env.S3_BUCKET!, Key: key }),
    );
  }

  getUrl(key: string): string {
    if (env.S3_PUBLIC_URL) {
      return `${env.S3_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    }
    if (env.S3_ENDPOINT) {
      return `${env.S3_ENDPOINT.replace(/\/$/, '')}/${env.S3_BUCKET}/${key}`;
    }
    return `https://${env.S3_BUCKET}.s3.${env.S3_REGION ?? 'us-east-1'}.amazonaws.com/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    const { client, HeadObjectCommand } = await this.getClient();
    if (key.includes('..')) return false;
    try {
      await client.send(
        new HeadObjectCommand({ Bucket: env.S3_BUCKET!, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async read(key: string): Promise<Buffer> {
    const { client, GetObjectCommand } = await this.getClient();
    if (key.includes('..')) throw new Error('Invalid key');
    const response = await client.send(
      new GetObjectCommand({ Bucket: env.S3_BUCKET!, Key: key }),
    );
    if (!response.Body) throw new Error('Empty body');
    const chunks: Uint8Array[] = [];
    // @ts-expect-error Body es un Readable en Node
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
}

/**
 * Provider para Supabase Storage.
 *
 * Usa la API REST pública (no requiere SDK). Las URLs siguen el patrón
 * `https://<project>.supabase.co/storage/v1/object/<bucket>/<key>`.
 */
class SupabaseStorageProvider implements StorageProvider {
  private getBaseUrl(): string {
    if (!env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL requerido cuando STORAGE_DRIVER=supabase');
    }
    return `${env.SUPABASE_URL.replace(/\/$/, '')}/storage/v1`;
  }

  private getHeaders(): Record<string, string> {
    if (!env.SUPABASE_SERVICE_KEY) {
      throw new Error('SUPABASE_SERVICE_KEY requerido para escribir');
    }
    return {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      apikey: env.SUPABASE_SERVICE_KEY,
    };
  }

  async save(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ key: string; url: string; size: number }> {
    const ext = path.extname(originalName) || mimeToExt(mimeType);
    const key = `${crypto.randomUUID()}${ext}`;
    const url = `${this.getBaseUrl()}/object/${env.SUPABASE_BUCKET}/${key}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': mimeType,
        'x-upsert': 'false',
      },
      body: buffer,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase upload failed: ${res.status} ${text}`);
    }

    return { key, url: this.getUrl(key), size: buffer.length };
  }

  async delete(key: string): Promise<void> {
    if (key.includes('..')) throw new Error('Invalid key');
    const url = `${this.getBaseUrl()}/object/${env.SUPABASE_BUCKET}/${key}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Supabase delete failed: ${res.status}`);
    }
  }

  getUrl(key: string): string {
    return `${this.getBaseUrl()}/object/${env.SUPABASE_BUCKET}/${key}`;
  }

  async exists(key: string): Promise<boolean> {
    if (key.includes('..')) return false;
    const url = `${this.getBaseUrl()}/object/${env.SUPABASE_BUCKET}/${key}`;
    const res = await fetch(url, {
      method: 'HEAD',
      headers: this.getHeaders(),
    });
    return res.ok;
  }

  async read(key: string): Promise<Buffer> {
    if (key.includes('..')) throw new Error('Invalid key');
    const url = `${this.getBaseUrl()}/object/${env.SUPABASE_BUCKET}/${key}`;
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error(`Supabase read failed: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'audio/wav': '.wav',
    'audio/x-wav': '.wav',
    'audio/ogg': '.ogg',
    'audio/webm': '.webm',
    'audio/mp4': '.m4a',
  };
  return map[mime] || '.bin';
}

/**
 * Factory: devuelve el provider según `STORAGE_DRIVER`.
 */
function createStorageProvider(): StorageProvider {
  const driver = env.STORAGE_DRIVER;
  switch (driver) {
    case 's3':
      return new S3StorageProvider();
    case 'supabase':
      return new SupabaseStorageProvider();
    case 'local':
    default:
      return new LocalStorageProvider();
  }
}

export const storage = createStorageProvider();
export { STORAGE_DIR };
