export type InstrumentName = 'piano' | 'guitar' | 'trumpet' | 'violin' | 'flute' | 'harmonica'

export const INSTRUMENTS: { value: InstrumentName; label: string; icon: string }[] = [
  { value: 'piano', label: 'Piano', icon: '🎹' },
  { value: 'guitar', label: 'Guitarra', icon: '🎸' },
  { value: 'trumpet', label: 'Trompeta', icon: '🎺' },
  { value: 'violin', label: 'Violín', icon: '🎻' },
  { value: 'flute', label: 'Flauta', icon: '🪈' },
  { value: 'harmonica', label: 'Armónica', icon: '🎵' },
]

export interface Chord {
  chord: string
  beat: number
  duration: number
}

export interface Section {
  name: string
  chords: Chord[]
}

export interface Song {
  id: string
  title: string
  artist: string | null
  style_id: string
  difficulty: number
  key_signature: string
  bpm: number
  instrument?: InstrumentName
  chord_data: {
    sections: Section[]
  }
  is_published: boolean
  created_at: string
}

export interface Style {
  id: string
  name: string
  difficulty: number
  theory_required: string[]
  techniques: string[]
  description: string
}

export interface Exercise {
  type: 'interval' | 'triad' | 'seventh_chord'
  notes: string[]
  answer: string
  options: string[]
  root: string
}

export interface Tip {
  id: string
  content: string
  category: 'teoría' | 'técnica' | 'mentalidad' | 'worship'
  style_id: string | null
  difficulty_min: number
}

export interface UserSettings {
  tempo_bpm: number
  language: string
  notifications_enabled: boolean
  feedback_concept: 'pulse' | 'bar' | 'rings'
  xp: number
  preferred_instrument: InstrumentName
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

export interface SongAudio {
  id: string
  song_id: string
  blob: Blob
  name: string
  size: number
  type: string
  created_at: string
}

export interface PracticeSession {
  id: string
  user_id: string
  song_id: string
  started_at: string
  duration_s: number
  completed: boolean
}