export type FeedbackConcept = 'pulse' | 'bar' | 'rings'

export interface FeedbackRing {
  radius: number
  alpha: number
  color: string
}