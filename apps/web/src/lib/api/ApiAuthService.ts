/**
 * AuthService que consume la API backend (apps/api).
 * Implementa la interfaz IAuthService — drop-in replacement del AuthService Dexie.
 *
 * Diferencias con el AuthService local:
 * - Las contraseñas se hashean en el backend, no en el cliente.
 * - El token JWT se persiste en `tokenStore` (localStorage).
 * - El perfil local (LocalProfile) se deriva de la respuesta de la API.
 */

import type { IAuthService } from '@/services/AuthService';
import type { LocalProfile } from '@/types/profile';
import type { UserSettings } from '@/types/music';
import { DEFAULT_SETTINGS } from '@/lib/db';
import { apiClient, ApiError } from '@/lib/api/client';
import { tokenStore, type AuthUser } from '@/lib/api/tokenStore';
import type { AuthResponse, MeResponse, ApiUser } from '@/lib/api/types';

function userToLocalProfile(user: ApiUser): LocalProfile {
  return {
    id: user.id,
    display_name: user.displayName ?? user.email.split('@')[0] ?? 'Usuario',
    pin_hash: null, // El backend maneja el PIN, no se expone al cliente
    settings: (user.settings as UserSettings | undefined) ?? { ...DEFAULT_SETTINGS },
    created_at: user.createdAt,
    last_active: user.lastActiveAt ?? new Date().toISOString(),
  };
}

function toAuthUser(user: ApiUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

export class ApiAuthService implements IAuthService {
  private activeUser: LocalProfile | null = null;

  async getActiveUser(): Promise<LocalProfile | null> {
    if (this.activeUser) return this.activeUser;

    const token = tokenStore.getToken();
    if (!token) return null;

    try {
      const { user } = await apiClient.get<MeResponse>('/api/auth/me');
      this.activeUser = userToLocalProfile(user);
      return this.activeUser;
    } catch (err) {
      if (ApiError.isUnauthorized(err)) {
        tokenStore.clear();
      }
      return null;
    }
  }

  async setActiveUser(userId: string): Promise<void> {
    const token = tokenStore.getToken();
    if (!token) throw new Error('No hay sesión activa');
    // El backend identifica al usuario por JWT, no por userId. Validamos que coincida.
    const stored = tokenStore.getUser();
    if (!stored || stored.id !== userId) {
      throw new Error('El usuario no coincide con la sesión actual');
    }
    // Forzar recarga del perfil
    this.activeUser = null;
    await this.getActiveUser();
  }

  clearActiveUser(): void {
    this.activeUser = null;
  }

  async getAllProfiles(): Promise<LocalProfile[]> {
    // La API no expone listado de otros usuarios. Devolvemos solo el actual.
    const current = await this.getActiveUser();
    return current ? [current] : [];
  }

  async createProfile(displayName: string, pin?: string): Promise<LocalProfile> {
    // La API usa email+password. Para "crear perfil local" sin email,
    // generamos un email interno único.
    const internalEmail = `local-${crypto.randomUUID()}@worship-piano.local`;
    const password = crypto.randomUUID();

    const { user, token } = await apiClient.post<AuthResponse>('/api/auth/register', {
      email: internalEmail,
      password,
      displayName,
      ...(pin && { pin }),
    });

    tokenStore.setAuth(token, toAuthUser(user));
    this.activeUser = userToLocalProfile(user);
    return this.activeUser;
  }

  async login(profileId: string, _pin?: string): Promise<LocalProfile> {
    // El login con PIN no está implementado en el backend actual.
    // En esta fase, login asume que el perfil ya está en la sesión activa
    // (login tradicional usa email+password — ver `loginWithCredentials`).
    const current = await this.getActiveUser();
    if (!current) throw new Error('No hay sesión activa');
    if (current.id !== profileId) throw new Error('PIN incorrecto');
    return current;
  }

  async logout(): Promise<void> {
    tokenStore.clear();
    this.activeUser = null;
  }

  /** Helper adicional: login con email+password (no parte de IAuthService). */
  async loginWithCredentials(email: string, password: string): Promise<LocalProfile> {
    const { user, token } = await apiClient.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    });

    tokenStore.setAuth(token, toAuthUser(user));
    this.activeUser = userToLocalProfile(user);
    return this.activeUser;
  }

  async deleteProfile(profileId: string): Promise<void> {
    // No exponemos delete en /me aún. Como workaround, limpiamos sesión local.
    const current = tokenStore.getUser();
    if (current?.id === profileId) {
      tokenStore.clear();
      this.activeUser = null;
    }
  }

  async updateProfileName(profileId: string, name: string): Promise<void> {
    await apiClient.patch<MeResponse>('/api/auth/me', { displayName: name });
    if (this.activeUser) {
      this.activeUser = { ...this.activeUser, display_name: name };
    }
    const stored = tokenStore.getUser();
    if (stored && stored.id === profileId) {
      tokenStore.setAuth(tokenStore.getToken()!, { ...stored, displayName: name });
    }
  }
}
