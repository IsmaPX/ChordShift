/**
 * Cliente HTTP base para consumir la API del backend.
 *
 * Características:
 * - Inyecta automáticamente el token JWT desde el token store
 * - Maneja errores de red y HTTP de forma tipada
 * - Soporte para AbortSignal (cancelación)
 * - Serialización automática de JSON
 */

import { tokenStore } from './tokenStore';

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string | undefined,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isUnauthorized(err: unknown): err is ApiError {
    return err instanceof ApiError && err.status === 401;
  }

  static isNetworkError(err: unknown): boolean {
    return err instanceof ApiError && err.status === 0;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001';

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path, API_BASE_URL);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorResponse | null = null;
  try {
    body = (await response.json()) as ApiErrorResponse;
  } catch {
    // No JSON body
  }

  return new ApiError(
    response.status,
    body?.code,
    body?.error ?? response.statusText ?? 'Error desconocido',
    body?.details,
  );
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { signal, headers = {}, query } = options;

  const token = tokenStore.getToken();
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: finalHeaders,
      signal,
      ...(method !== 'GET' && { body: JSON.stringify(options.body) }),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con el servidor');
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, { ...options, body } as RequestOptions & { body: unknown }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, { ...options, body } as RequestOptions & { body: unknown }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>('DELETE', path, options),
} as const;

export { API_BASE_URL };
