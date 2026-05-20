export type FeedbackConcept = 'pulse' | 'bar' | 'rings'

export interface FeedbackRing {
  radius: number
  alpha: number
  color: string
}

export type ExerciseType = 'interval' | 'triad' | 'seventh_chord'

export interface Exercise {
  type: ExerciseType
  notes: string[]
  answer: string
  options: string[]
}