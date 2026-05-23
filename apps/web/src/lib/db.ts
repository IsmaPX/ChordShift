import Dexie, { type Table } from 'dexie'
import type { Song, SongAudio, Style, Tip, PracticeSession, UserSettings } from '@/types/music'
import type { LocalProfile } from '@/types/profile'
import { SEED_STYLES } from '@/data/styles'
import { SEED_TIPS } from '@/data/tips'
import { SEED_SONGS } from '@/data/songs'

const DEFAULT_SETTINGS: UserSettings = {
  tempo_bpm: 120,
  language: 'es',
  notifications_enabled: true,
  feedback_concept: 'rings',
  xp: 0,
  preferred_instrument: 'piano',
}

interface EarTrainingResult {
  id?: string
  user_id: string
  exercise_type: 'interval' | 'triad' | 'seventh_chord'
  question: { notes: string[]; root: string }
  answer_given: string
  correct_answer: string
  is_correct: boolean
  response_ms: number
  created_at: string
}

export class AppDatabase extends Dexie {
  users!: Table<LocalProfile, string>
  styles!: Table<Style, string>
  songs!: Table<Song, string>
  practice_sessions!: Table<PracticeSession, string>
  song_audio!: Table<SongAudio, string>
  ear_training_results!: Table<EarTrainingResult, string>
  tips!: Table<Tip, string>

  constructor() {
    super('WorshipPianoApp')
    this.version(1).stores({
      users: 'id, display_name, created_at, last_active',
      styles: 'id, name, difficulty',
      songs: 'id, title, style_id, difficulty, is_published, instrument',
      practice_sessions: 'id, user_id, song_id, started_at',
      song_audio: 'id, song_id',
      ear_training_results: 'id, user_id, exercise_type, created_at',
      tips: 'id, category, style_id, difficulty_min',
    })
  }

  async seedIfEmpty(): Promise<void> {
    const styleCount = await this.styles.count()
    if (styleCount === 0) {
      await this.styles.bulkAdd(SEED_STYLES as Style[])
    }
    const tipCount = await this.tips.count()
    if (tipCount === 0) {
      await this.tips.bulkAdd(SEED_TIPS as Tip[])
    }
    const songCount = await this.songs.count()
    if (songCount === 0) {
      await this.songs.bulkAdd(SEED_SONGS as Song[])
    }
  }
}

export const db = new AppDatabase()

export { DEFAULT_SETTINGS }
export type { EarTrainingResult }
