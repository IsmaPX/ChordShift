import { userRepository, type IUserRepository } from '@/lib/repositories/UserRepository'
import type { LocalProfile } from '@/types/profile'
import { DEFAULT_SETTINGS } from '@/lib/db'
import { createModuleLogger } from '@/lib/logger'

const log = createModuleLogger('AuthService')

export interface IAuthService {
  getActiveUser(): Promise<LocalProfile | null>
  setActiveUser(userId: string): Promise<void>
  clearActiveUser(): void
  getAllProfiles(): Promise<LocalProfile[]>
  createProfile(displayName: string, pin?: string): Promise<LocalProfile>
  login(profileId: string, pin?: string): Promise<LocalProfile>
  logout(): void
  deleteProfile(profileId: string): Promise<void>
  updateProfileName(profileId: string, name: string): Promise<void>
}

export class AuthService implements IAuthService {
  private repository: IUserRepository
  private readonly ACTIVE_PROFILE_KEY = 'worship_piano_active_profile'

  constructor(repository: IUserRepository = userRepository) {
    this.repository = repository
  }

  private async hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin + 'worship-piano-salt')
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  async getActiveUser(): Promise<LocalProfile | null> {
    const activeId = localStorage.getItem(this.ACTIVE_PROFILE_KEY)
    if (!activeId) return null
    const profile = await this.repository.getById(activeId)
    if (!profile) {
      localStorage.removeItem(this.ACTIVE_PROFILE_KEY)
    }
    return profile ?? null
  }

  async setActiveUser(userId: string): Promise<void> {
    const profile = await this.repository.getById(userId)
    if (!profile) throw new Error('Perfil no encontrado')
    localStorage.setItem(this.ACTIVE_PROFILE_KEY, userId)
    log.info('setActiveUser', { userId })
  }

  clearActiveUser(): void {
    localStorage.removeItem(this.ACTIVE_PROFILE_KEY)
    log.info('clearActiveUser')
  }

  async getAllProfiles(): Promise<LocalProfile[]> {
    return this.repository.getAll()
  }

  async createProfile(displayName: string, pin?: string): Promise<LocalProfile> {
    const pin_hash = pin ? await this.hashPin(pin) : null
    const profileData = {
      display_name: displayName,
      pin_hash,
      settings: { ...DEFAULT_SETTINGS },
    }
    const id = await this.repository.create(profileData)
    const profile = await this.repository.getById(id)
    if (!profile) throw new Error('Error al crear perfil')
    localStorage.setItem(this.ACTIVE_PROFILE_KEY, id)
    log.info('createProfile', { id, displayName })
    return profile
  }

  async login(profileId: string, pin?: string): Promise<LocalProfile> {
    const profile = await this.repository.getById(profileId)
    if (!profile) throw new Error('Perfil no encontrado')

    if (profile.pin_hash) {
      if (!pin) throw new Error('PIN requerido')
      const hash = await this.hashPin(pin)
      if (hash !== profile.pin_hash) throw new Error('PIN incorrecto')
    }

    localStorage.setItem(this.ACTIVE_PROFILE_KEY, profileId)
    log.info('login', { profileId })
    return profile
  }

  logout(): void {
    this.clearActiveUser()
    log.info('logout')
  }

  async deleteProfile(profileId: string): Promise<void> {
    const activeId = localStorage.getItem(this.ACTIVE_PROFILE_KEY)
    if (activeId === profileId) {
      this.clearActiveUser()
    }
    await this.repository.delete(profileId)
    log.info('deleteProfile', { profileId })
  }

  async updateProfileName(profileId: string, name: string): Promise<void> {
    await this.repository.update(profileId, { display_name: name })
    log.info('updateProfileName', { profileId, name })
  }
}

export const authService = new AuthService()