/**
 * Validators para el endpoint de sync batch (outbox pattern).
 *
 * El cliente acumula operaciones mientras está offline y las envía
 * en batch cuando recupera conexión. El backend las procesa en orden
 * y devuelve el resultado de cada una.
 */

import { z } from 'zod';

// ============================================================================
// Operaciones permitidas
// ============================================================================

const createSongOp = z.object({
  op: z.literal('create_song'),
  clientId: z.string(),  // ID temporal del cliente, para reconciliar
  data: z.object({
    title: z.string().min(1),
    artist: z.string().nullable().optional(),
    styleId: z.string().uuid(),
    difficulty: z.number().int().min(1).max(5),
    keySignature: z.string().min(1),
    bpm: z.number().int().min(20).max(300),
    chordData: z.object({
      sections: z.array(z.object({
        name: z.string(),
        chords: z.array(z.object({
          chord: z.string(),
          beat: z.number().int().nonnegative(),
          duration: z.number().positive(),
        })).min(1),
      })).min(1),
    }),
  }),
});

const deleteSongOp = z.object({
  op: z.literal('delete_song'),
  clientId: z.string(),
  data: z.object({ id: z.string().uuid() }),
});

const createSessionOp = z.object({
  op: z.literal('create_session'),
  clientId: z.string(),
  data: z.object({
    songId: z.string().uuid(),
    startedAt: z.string().datetime(),
    durationS: z.number().int().nonnegative(),
    completed: z.boolean(),
  }),
});

const createEarTrainingOp = z.object({
  op: z.literal('create_ear_training'),
  clientId: z.string(),
  data: z.object({
    exerciseType: z.enum(['interval', 'triad', 'seventh_chord']),
    question: z.object({
      notes: z.array(z.string()).min(1),
      root: z.string(),
    }),
    answerGiven: z.string(),
    correctAnswer: z.string(),
    isCorrect: z.boolean(),
    responseMs: z.number().int().nonnegative(),
    createdAt: z.string().datetime().optional(),
  }),
});

const addXpOp = z.object({
  op: z.literal('add_xp'),
  clientId: z.string(),
  data: z.object({
    xp: z.number().int().positive(),
  }),
});

const updateSettingsOp = z.object({
  op: z.literal('update_settings'),
  clientId: z.string(),
  data: z.object({
    tempo_bpm: z.number().int().optional(),
    language: z.string().optional(),
    notifications_enabled: z.boolean().optional(),
    feedback_concept: z.enum(['pulse', 'bar', 'rings']).optional(),
    xp: z.number().int().optional(),
    preferred_instrument: z.enum(['piano', 'guitar', 'trumpet']).optional(),
    metronome_enabled: z.boolean().optional(),
    metronome_volume: z.number().min(0).max(1).optional(),
    difficulty: z.number().int().min(1).max(5).optional(),
  }),
});

export const syncOperationSchema = z.discriminatedUnion('op', [
  createSongOp,
  deleteSongOp,
  createSessionOp,
  createEarTrainingOp,
  addXpOp,
  updateSettingsOp,
]);

export const syncBatchSchema = z.object({
  body: z.object({
    operations: z.array(syncOperationSchema).min(1).max(100),
    /**
     * Timestamp del cliente cuando empezó a acumular ops. El backend puede
     * usarlo para detectar operaciones muy antiguas y aplicar políticas
     * de expiración.
     */
    sinceLastSync: z.string().datetime().optional(),
  }),
});

export type SyncOperation = z.infer<typeof syncOperationSchema>;
export type SyncBatchInput = z.infer<typeof syncBatchSchema>['body'];

// Resultado por operación
export interface SyncOperationResult {
  clientId: string;
  op: string;
  status: 'applied' | 'rejected' | 'error';
  serverId?: string;
  error?: string;
}

export interface SyncBatchResult {
  applied: number;
  rejected: number;
  errors: number;
  results: SyncOperationResult[];
  serverTime: string;
}
