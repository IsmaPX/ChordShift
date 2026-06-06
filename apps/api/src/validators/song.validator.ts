/**
 * Validators para Songs.
 */

import { z } from 'zod';

const chordSchema = z.object({
  chord: z.string().min(1),
  beat: z.number().int().nonnegative(),
  duration: z.number().positive(),
});

const sectionSchema = z.object({
  name: z.string().min(1),
  chords: z.array(chordSchema).min(1),
});

export const createSongSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    artist: z.string().max(200).nullable().optional(),
    styleId: z.string().uuid(),
    difficulty: z.number().int().min(1).max(5),
    keySignature: z.string().min(1).max(10),
    bpm: z.number().int().min(20).max(300),
    chordData: z.object({
      sections: z.array(sectionSchema).min(1),
    }),
    isPublished: z.boolean().default(false),
  }),
});

export const updateSongSchema = z.object({
  body: createSongSchema.shape.body.partial(),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listSongsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    styleId: z.string().uuid().optional(),
    tab: z.enum(['all', 'preset', 'mine']).default('all'),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
  }),
});

export type CreateSongInput = z.infer<typeof createSongSchema>['body'];
export type UpdateSongInput = z.infer<typeof updateSongSchema>['body'];
export type ListSongsQuery = z.infer<typeof listSongsSchema>['query'];
