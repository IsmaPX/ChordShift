/**
 * Validators para audio uploads.
 */

import { z } from 'zod';

const ALLOWED_MIME = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
  'audio/mp4',
] as const;

export const uploadAudioSchema = z.object({
  params: z.object({
    songId: z.string().uuid(),
  }),
});

export const audioMetadataSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(ALLOWED_MIME),
});

export type AudioMetadata = z.infer<typeof audioMetadataSchema>;
