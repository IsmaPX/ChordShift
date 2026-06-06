/**
 * Validators para Settings (PATCH /api/users/:id/settings).
 */

import { z } from 'zod';

const userSettingsSchema = z.object({
  tempo_bpm: z.number().int().min(20).max(300).optional(),
  language: z.string().min(2).max(10).optional(),
  notifications_enabled: z.boolean().optional(),
  feedback_concept: z.enum(['pulse', 'bar', 'rings']).optional(),
  xp: z.number().int().nonnegative().optional(),
  preferred_instrument: z.enum(['piano', 'guitar', 'trumpet']).optional(),
  metronome_enabled: z.boolean().optional(),
  metronome_volume: z.number().min(0).max(1).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  pin_enabled: z.boolean().optional(),
  phone_number: z.string().optional(),
  phone_verified: z.boolean().optional(),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  reminder_days: z.array(z.number().int().min(0).max(6)).optional(),
  last_reminder_sent: z.string().optional(),
});

export const updateSettingsSchema = z.object({
  body: userSettingsSchema.partial(),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const addXpSchema = z.object({
  body: z.object({
    xp: z.number().int().positive().max(10000),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const setPhoneSchema = z.object({
  body: z.object({
    phone: z.string().regex(/^\+\d{10,15}$/, 'Formato E.164 requerido'),
    verified: z.boolean().default(false),
  }),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>['body'];
export type AddXpInput = z.infer<typeof addXpSchema>['body'];
export type SetPhoneInput = z.infer<typeof setPhoneSchema>['body'];
