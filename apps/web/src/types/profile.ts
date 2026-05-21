import type { UserSettings } from './music'

export interface LocalProfile {
  id: string
  display_name: string
  pin_hash: string | null
  settings: UserSettings
  created_at: string
  last_active: string | null
}

export interface LoginCredentials {
  profileId: string
  pin?: string
}

export interface RegisterCredentials {
  display_name: string
  pin?: string
}
