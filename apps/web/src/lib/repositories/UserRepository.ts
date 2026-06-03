import { db } from '../db'
import type { LocalProfile } from '@/types/profile'
import { createModuleLogger } from '../logger'

const log = createModuleLogger('UserRepository')

export interface IUserRepository {
  getById(id: string): Promise<LocalProfile | undefined>
  getAll(): Promise<LocalProfile[]>
  create(profile: Omit<LocalProfile, 'id' | 'created_at' | 'last_active'>): Promise<string>
  update(id: string, changes: Partial<LocalProfile>): Promise<void>
  delete(id: string): Promise<void>
  updateLastActive(id: string): Promise<void>
}

export class DexieUserRepository implements IUserRepository {
  async getById(id: string): Promise<LocalProfile | undefined> {
    log.debug('getById', { id })
    return db.users.get(id)
  }

  async getAll(): Promise<LocalProfile[]> {
    log.debug('getAll')
    return db.users.orderBy('created_at').toArray()
  }

  async create(profile: Omit<LocalProfile, 'id' | 'created_at' | 'last_active'>): Promise<string> {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const newProfile: LocalProfile = {
      ...profile,
      id,
      created_at: now,
      last_active: now,
    }
    log.info('create', { id, display_name: profile.display_name })
    await db.users.add(newProfile)
    return id
  }

  async update(id: string, changes: Partial<LocalProfile>): Promise<void> {
    log.debug('update', { id, changes })
    await db.users.update(id, changes)
  }

  async delete(id: string): Promise<void> {
    log.info('delete', { id })
    await db.users.delete(id)
  }

  async updateLastActive(id: string): Promise<void> {
    await db.users.update(id, { last_active: new Date().toISOString() })
  }
}

export const userRepository = new DexieUserRepository()