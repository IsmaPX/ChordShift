import type { ISettingsRepository } from './interfaces'
import type { UserSettings } from '@/types/music'
import type { LocalProfile } from '@/types/profile'
import { db } from '@/lib/db'

export class SettingsRepository implements ISettingsRepository {
  async getByProfileId(profileId: string): Promise<LocalProfile | undefined> {
    return db.users.get(profileId)
  }

  async updateSettings(profileId: string, settings: Partial<UserSettings>): Promise<void> {
    const profile = await db.users.get(profileId)
    if (profile) {
      const merged = { ...profile.settings, ...settings }
      await db.users.update(profileId, { settings: merged })
    }
  }

  async addXP(profileId: string, xp: number): Promise<void> {
    const profile = await db.users.get(profileId)
    if (profile) {
      const currentXP = profile.settings?.xp || 0
      await db.users.update(profileId, {
        settings: { ...profile.settings, xp: currentXP + xp },
      })
    }
  }

  async setPin(profileId: string, pinHash: string | null): Promise<void> {
    const profile = await db.users.get(profileId)
    if (profile) {
      await db.users.update(profileId, {
        pin_hash: pinHash,
        settings: { ...profile.settings, pin_enabled: !!pinHash },
      })
    }
  }

  async getPhoneNumber(profileId: string): Promise<string | undefined> {
    const profile = await db.users.get(profileId)
    return profile?.settings?.phone_number || undefined
  }

  async savePhoneNumber(profileId: string, phone: string, verified: boolean): Promise<void> {
    const profile = await db.users.get(profileId)
    if (profile) {
      await db.users.update(profileId, {
        settings: { ...profile.settings, phone_number: phone, phone_verified: verified },
      })
    }
  }

  async clearPhoneNumber(profileId: string): Promise<void> {
    const profile = await db.users.get(profileId)
    if (profile) {
      await db.users.update(profileId, {
        settings: {
          ...profile.settings,
          phone_number: '',
          phone_verified: false,
        },
      })
    }
  }

  async getAllProfiles(): Promise<LocalProfile[]> {
    return db.users.toArray()
  }

  async seedIfEmpty(): Promise<void> {
    const count = await db.users.count()
    if (count === 0) {
      await db.users.add({
        id: crypto.randomUUID(),
        display_name: 'Usuario',
        pin_hash: null,
        settings: {
          tempo_bpm: 120,
          language: 'es',
          notifications_enabled: true,
          feedback_concept: 'rings',
          xp: 0,
          preferred_instrument: 'piano',
          metronome_enabled: true,
          metronome_volume: 0.5,
          difficulty: 1,
          pin_enabled: false,
          phone_number: '',
          phone_verified: false,
          reminder_time: '18:00',
          reminder_days: [1, 3, 5],
          last_reminder_sent: '',
        },
        created_at: new Date().toISOString(),
        last_active: null,
      })
    }
  }
}

export const settingsRepository = new SettingsRepository()
