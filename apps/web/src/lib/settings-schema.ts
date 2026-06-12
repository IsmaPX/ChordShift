import { z } from 'zod'
import type { InstrumentName } from '@/types/music'

export const settingsSchema = z.object({
  tempo_bpm: z.number().min(60).max(200),
  language: z.string(),
  notifications_enabled: z.boolean(),
  feedback_concept: z.enum(['pulse', 'bar', 'rings']),
  preferred_instrument: z.enum(['piano', 'guitar', 'trumpet', 'violin', 'flute', 'harmonica']) as z.ZodType<InstrumentName>,
  metronome_enabled: z.boolean(),
  metronome_volume: z.number().min(0).max(1),
  difficulty: z.number().min(1).max(5),
})

export type SettingsForm = z.infer<typeof settingsSchema>
