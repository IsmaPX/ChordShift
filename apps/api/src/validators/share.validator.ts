/**
 * Validators para SongShare.
 */

import { z } from 'zod';

const permissionSchema = z.enum(['view', 'edit']);

export const createShareSchema = z.object({
  body: z.object({
    songId: z.string().uuid(),
    sharedWithEmail: z.string().email(),
    permission: permissionSchema.default('view'),
  }),
});

export const listSharedWithMeSchema = z.object({
  query: z.object({
    permission: permissionSchema.optional(),
  }),
});

export type CreateShareInput = z.infer<typeof createShareSchema>['body'];
export type ListSharedWithMeQuery = z.infer<typeof listSharedWithMeSchema>['query'];
