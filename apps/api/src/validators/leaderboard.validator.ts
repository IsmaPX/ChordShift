/**
 * Validators para Leaderboard.
 */

import { z } from 'zod';

const periodSchema = z.enum(['daily', 'weekly', 'monthly', 'all_time']);

export const leaderboardQuerySchema = z.object({
  query: z.object({
    category: z.enum(['total_minutes', 'sessions_completed', 'ear_training_accuracy', 'streak_days']).default('total_minutes'),
    period: periodSchema.default('all_time'),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>['query'];
