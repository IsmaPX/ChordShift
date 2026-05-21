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
}

export interface PracticeSession {
  id: string
  user_id: string
  song_id: string
  started_at: string
  duration_s: number
  completed: boolean
}