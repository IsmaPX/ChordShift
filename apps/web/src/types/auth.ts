import type { UserSettings } from '@/types/music'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface User {
  id: string
  email: string
  display_name: string | null
  settings: UserSettings
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  display_name: string
}