import type { Song, SongAudio, Style, Tip, PracticeSession, UserSettings } from '@/types/music'
import type { LocalProfile } from '@/types/profile'

export interface IRepository<T> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
}

export interface ISongRepository extends IRepository<Song> {
  search(query: string, styleId?: string, tab?: 'all' | 'preset' | 'mine'): Promise<Song[]>
  getPaginated(opts: { limit: number; offset?: number; styleId?: string; search?: string; tab?: 'all' | 'preset' | 'mine' }): Promise<{ songs: Song[]; total: number }>
  getByStyle(styleId: string): Promise<Song[]>
  create(data: Omit<Song, 'id'> & { id: string }): Promise<Song>
  update(id: string, data: Partial<Song>): Promise<void>
  remove(id: string): Promise<void>
  getAudio(songId: string): Promise<SongAudio | undefined>
  saveAudio(songId: string, file: Blob, name: string, type: string): Promise<void>
  removeAudio(songId: string): Promise<void>
  seedIfEmpty(): Promise<void>
}

export interface IPracticeSessionRepository extends IRepository<PracticeSession> {
  getBySongId(songId: string): Promise<PracticeSession[]>
  getByUserId(userId: string): Promise<PracticeSession[]>
  create(data: Omit<PracticeSession, 'id'> & { id: string }): Promise<PracticeSession>
  update(id: string, data: Partial<PracticeSession>): Promise<void>
  deleteByUserId(userId: string): Promise<void>
}

export interface ISettingsRepository {
  getByProfileId(profileId: string): Promise<LocalProfile | undefined>
  updateSettings(profileId: string, settings: Partial<UserSettings>): Promise<void>
  addXP(profileId: string, xp: number): Promise<void>
  setPin(profileId: string, pinHash: string | null): Promise<void>
  getPhoneNumber(profileId: string): Promise<string | undefined>
  savePhoneNumber(profileId: string, phone: string, verified: boolean): Promise<void>
  clearPhoneNumber(profileId: string): Promise<void>
  seedIfEmpty(): Promise<void>
  getAllProfiles(): Promise<LocalProfile[]>
}

export interface IEarTrainingRepository {
  create(data: import('@/lib/db').EarTrainingResult): Promise<void>
  getByUserId(userId: string): Promise<import('@/lib/db').EarTrainingResult[]>
  deleteByUserId(userId: string): Promise<void>
}

export interface IStyleRepository extends IRepository<Style> {
  seedIfEmpty(): Promise<void>
}

export interface ITipRepository extends IRepository<Tip> {
  seedIfEmpty(): Promise<void>
}

export interface IAuthRepository {
  getProfileById(id: string): Promise<LocalProfile | undefined>
  getAllProfiles(): Promise<LocalProfile[]>
  createProfile(data: LocalProfile): Promise<void>
  deleteProfile(id: string): Promise<void>
  updateLastActive(id: string): Promise<void>
}
