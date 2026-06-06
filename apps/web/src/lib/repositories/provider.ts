/**
 * Provider selector: elige entre implementación Dexie (offline) o API (cloud)
 * según la configuración del entorno.
 *
 * Default: 'dexie' (preserva la experiencia offline actual).
 * Para activar cloud: setear VITE_API_URL + localStorage flag.
 */

import type { IAuthService } from '@/services/AuthService';
import type { ISongRepository } from './interfaces';
import type { IPracticeSessionRepository } from './interfaces';
import type { ISettingsRepository } from './interfaces';
import type { IStyleRepository } from './interfaces';
import type { ITipRepository } from './interfaces';
import type { IEarTrainingRepository } from './interfaces';
import type { IUserRepository } from './UserRepository';

// Dexie (default)
import { AuthService } from '@/services/AuthService';
import { DexieUserRepository } from './UserRepository';
import { SongRepository } from './SongRepository';
import { PracticeSessionRepository } from './SessionRepository';
import { SettingsRepository } from './SettingsRepository';
import { StyleRepository } from './StyleRepository';
import { TipRepository } from './TipRepository';
import { EarTrainingRepository } from './EarTrainingRepository';

// API
import { ApiAuthService } from '@/lib/api/ApiAuthService';
import { ApiSongRepository } from '@/lib/api/ApiSongRepository';
import { ApiPracticeSessionRepository } from '@/lib/api/ApiPracticeSessionRepository';
import { ApiSettingsRepository } from '@/lib/api/ApiSettingsRepository';
import { ApiStyleRepository } from '@/lib/api/ApiStyleRepository';
import { ApiTipRepository } from '@/lib/api/ApiTipRepository';
import { ApiEarTrainingRepository } from '@/lib/api/ApiEarTrainingRepository';

export type BackendMode = 'dexie' | 'api';

const STORAGE_KEY = 'worship_piano_backend_mode';

function detectMode(): BackendMode {
  // Permitir override via localStorage (útil para testing y feature flags)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'api' || stored === 'dexie') return stored;
  }

  // Si VITE_API_URL está definida, usar API por defecto
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    return 'api';
  }

  return 'dexie';
}

class RepositoryProvider {
  public mode: BackendMode = detectMode();
  private listeners = new Set<() => void>();

  getMode(): BackendMode {
    return this.mode;
  }

  setMode(mode: BackendMode): void {
    this.mode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);
    }
    for (const listener of this.listeners) {
      try {
        listener();
      } catch {
        // Ignore listener errors
      }
    }
  }

  /** Suscripción a cambios de modo (para useSyncExternalStore). */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Servicios tipados con sus interfaces
  getAuthService(): IAuthService {
    return this.mode === 'api' ? new ApiAuthService() : new AuthService();
  }

  getUserRepository(): IUserRepository {
    // ApiAuthService contiene su propia lógica de usuario.
    return new DexieUserRepository();
  }

  getSongRepository(): ISongRepository {
    return this.mode === 'api' ? new ApiSongRepository() : new SongRepository();
  }

  getPracticeSessionRepository(): IPracticeSessionRepository {
    return this.mode === 'api' ? new ApiPracticeSessionRepository() : new PracticeSessionRepository();
  }

  getSettingsRepository(): ISettingsRepository {
    return this.mode === 'api' ? new ApiSettingsRepository() : new SettingsRepository();
  }

  getStyleRepository(): IStyleRepository {
    return this.mode === 'api' ? new ApiStyleRepository() : new StyleRepository();
  }

  getTipRepository(): ITipRepository {
    return this.mode === 'api' ? new ApiTipRepository() : new TipRepository();
  }

  getEarTrainingRepository(): IEarTrainingRepository {
    return this.mode === 'api' ? new ApiEarTrainingRepository() : new EarTrainingRepository();
  }
}

export const repositoryProvider = new RepositoryProvider();

/** Sólo para tests. Reinicia el mode al default (dexie o api según env). */
export function __resetRepositoryProviderForTests(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  repositoryProvider.mode = 'dexie';
}

/**
 * Helpers de conveniencia para tests y feature flags.
 */
export function useApi(): boolean {
  return repositoryProvider.getMode() === 'api';
}

export function switchToApi(): void {
  repositoryProvider.setMode('api');
}

export function switchToDexie(): void {
  repositoryProvider.setMode('dexie');
}
