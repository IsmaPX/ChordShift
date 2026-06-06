/**
 * Validators para Practice Sessions.
 */

import { z } from 'zod';

export const createSessionSchema = z.object({
  body: z.object({
    songId: z.string().uuid(),
    durationS: z.number().int().nonnegative(),
    completed: z.boolean().default(false),
  }),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>['body'];
