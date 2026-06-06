/**
 * ApiSettingsRepository — settings y perfil contra el backend.
 *
 * Las settings se persisten en la columna JSON `users.settings` del backend.
 * Implementa todas las operaciones de ISettingsRepository contra los endpoints reales.
 */

import type { ISettingsRepository } from '../interfaces';
import type { UserSettings } from '@/types/music';
import type { LocalProfile } from '@/types/profile';
import { apiClient } from '@/lib/api/client';
import { tokenStore } from '@/lib/api/tokenStore';
import { DEFAULT_SETTINGS } from '@/lib/db';
import type { MeResponse } from '@/lib/api/types';

function toLocalProfile(user: MeResponse['user']): LocalProfile {
  return {
    id: user.id,
    display_name: user.displayName ?? user.email.split('@')[0] ?? 'Usuario',
    pin_hash: null,
    settings: (user.settings as UserSettings | undefined) ?? { ...DEFAULT_SETTINGS },
    created_at: user.createdAt,
    last_active: user.lastActiveAt ?? new Date().toISOString(),
  };
}

function getCurrentUserId(): string | null {
  return tokenStore.getUser()?.id ?? null;
}

export class ApiSettingsRepository implements ISettingsRepository {
  async getByProfileId(profileId: string): Promise<LocalProfile | undefined> {
    const stored = tokenStore.getUser();
    if (!stored || stored.id !== profileId) return undefined;
    const { user } = await apiClient.get<MeResponse>('/api/auth/me');
    return toLocalProfile(user);
  }

  async updateSettings(profileId: string, settings: Partial<UserSettings>): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId || userId !== profileId) {
      throw new Error('No autorizado a modificar este perfil');
    }
    await apiClient.patch<{ user: MeResponse['user'] }>(
      `/api/users/${userId}/settings`,
      settings,
    );
  }

  async addXP(profileId: string, xp: number): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId || userId !== profileId) {
      throw new Error('No autorizado');
    }
    await apiClient.post<{ xp: number }>(`/api/users/${userId}/xp`, { xp });
  }

  async setPin(profileId: string, pinHash: string | null): Promise<void> {
    // El backend acepta el PIN plano, no el hash (el backend lo hashea).
    // Si recibimos un hash, no podemos hacer nada útil. Este es un trade-off
    // documentado: el frontend debería enviar el PIN plano al backend.
    //
    // Por compatibilidad con la firma ISettingsRepository, hacemos un workaround:
    // extraemos el PIN del "hash" si es un PIN de 4-8 dígitos (no se ha hasheado
    // todavía) o lo ignoramos.
    if (pinHash === null) {
      const userId = getCurrentUserId();
      if (userId && userId === profileId) {
        await apiClient.patch<MeResponse>('/api/auth/me', { pin: null });
      }
      return;
    }
    // Si pinHash parece un PIN plano (4-8 dígitos), lo enviamos.
    if (/^\d{4,8}$/.test(pinHash)) {
      const userId = getCurrentUserId();
      if (userId && userId === profileId) {
        await apiClient.patch<MeResponse>('/api/auth/me', { pin: pinHash });
      }
    } else {
      console.warn(
        '[ApiSettingsRepository] setPin: el cliente envió un hash; el backend requiere PIN plano',
      );
    }
  }

  async getPhoneNumber(profileId: string): Promise<string | undefined> {
    const profile = await this.getByProfileId(profileId);
    return profile?.settings.phone_number || undefined;
  }

  async savePhoneNumber(
    profileId: string,
    phone: string,
    verified: boolean,
  ): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId || userId !== profileId) {
      throw new Error('No autorizado');
    }
    await apiClient.put<{ user: MeResponse['user'] }>(`/api/users/${userId}/phone`, {
      phone,
      verified,
    });
  }

  async clearPhoneNumber(profileId: string): Promise<void> {
    const userId = getCurrentUserId();
    if (!userId || userId !== profileId) {
      throw new Error('No autorizado');
    }
    await apiClient.delete<{ user: MeResponse['user'] }>(`/api/users/${userId}/phone`);
  }

  async getAllProfiles(): Promise<LocalProfile[]> {
    const userId = getCurrentUserId();
    if (!userId) return [];
    const current = await this.getByProfileId(userId);
    return current ? [current] : [];
  }

  async seedIfEmpty(): Promise<void> {
    // No-op
  }
}

export const apiSettingsRepository = new ApiSettingsRepository();
