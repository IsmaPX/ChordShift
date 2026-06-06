/**
 * Validators para Ear Training.
 */

import { z } from 'zod';

const exerciseTypeSchema = z.enum(['interval', 'triad', 'seventh_chord']);

const questionSchema = z.object({
  notes: z.array(z.string()).min(1),
  root: z.string(),
});

export const createEarTrainingResultSchema = z.object({
  body: z.object({
    exerciseType: exerciseTypeSchema,
    question: questionSchema,
    answerGiven: z.string().min(1).max(50),
    correctAnswer: z.string().min(1).max(50),
    isCorrect: z.boolean(),
    responseMs: z.number().int().nonnegative(),
  }),
});

export const listEarTrainingResultsSchema = z.object({
  query: z.object({
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
    exerciseType: exerciseTypeSchema.optional(),
  }),
});

export type CreateEarTrainingResultInput = z.infer<typeof createEarTrainingResultSchema>['body'];
export type ListEarTrainingResultsQuery = z.infer<typeof listEarTrainingResultsSchema>['query'];
