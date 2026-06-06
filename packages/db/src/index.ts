export interface User {
  id: string
  email: string
  display_name: string | null
  settings: UserSettings
  created_at: string
}

export interface UserSettings {
  tempo_bpm: number
  language: string
  notifications_enabled: boolean
  feedback_concept: 'pulse' | 'bar' | 'rings'
  xp: number
  preferred_instrument: 'piano' | 'guitar' | 'trumpet'
  metronome_enabled: boolean
  metronome_volume: number
  difficulty: number
  pin_enabled: boolean
  phone_number: string
  phone_verified: boolean
  reminder_time: string
  reminder_days: number[]
  last_reminder_sent: string
}

export interface Style {
  id: string
  name: string
  difficulty: number
  theory_required: string[]
  techniques: string[]
  description: string
}

export interface Song {
  id: string
  title: string
  artist: string | null
  style_id: string
  difficulty: number
  key_signature: string
  bpm: number
  chord_data: ChordData
  is_published: boolean
}

export interface ChordData {
  sections: Section[]
}

export interface Section {
  name: string
  chords: Chord[]
}

export interface Chord {
  chord: string
  beat: number
  duration: number
}

export interface PracticeSession {
  id: string
  user_id: string
  song_id: string
  started_at: string
  duration_s: number
  completed: boolean
}

export interface EarTrainingResult {
  id: string
  user_id: string
  exercise_type: 'interval' | 'triad' | 'seventh_chord'
  question: {
    notes: string[]
    root: string
  }
  answer_given: string
  correct_answer: string
  is_correct: boolean
  response_ms: number
  created_at: string
}

export interface Tip {
  id: string
  content: string
  category: 'teoría' | 'técnica' | 'mentalidad' | 'worship'
  style_id: string | null
  difficulty_min: number
}

export interface Notification {
  id: string
  user_id: string
  type: 'email' | 'push'
  message: string
  scheduled_at: string
  sent_at: string | null
}

// ============================================================================
// Live sessions (WebSockets)
// ============================================================================

export type LiveSessionStatus = 'active' | 'paused' | 'ended';

export interface LiveSessionState {
  sessionId: string
  hostId: string
  songId: string
  status: LiveSessionStatus
  currentBeat: number
  bpm: number
  startedAtMs: number
  participants: LiveSessionParticipant[]
}

export interface LiveSessionParticipant {
  id: string
  email: string
  displayName: string | null
}

export interface BeatPayload {
  sessionId: string
  beat: number
  emittedAtMs: number
}

// ============================================================================
// Leaderboard (tiempo real)
// ============================================================================

export type LeaderboardCategory = 'total_minutes' | 'sessions_completed' | 'ear_training_accuracy';
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string | null
  score: number
}

export interface LeaderboardSnapshot {
  category: LeaderboardCategory
  period: LeaderboardPeriod
  generatedAtMs: number
  entries: LeaderboardEntry[]
  myRank: number | null
}