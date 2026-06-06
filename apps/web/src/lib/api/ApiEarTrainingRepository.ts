/**
 * ApiEarTrainingRepository — resultados de ear training contra el backend.
 */

import type { IEarTrainingRepository } from '@/lib/repositories/interfaces';
import type { EarTrainingResult } from '@/lib/db';
import { apiClient } from '@/lib/api/client';

interface ApiEarTrainingResult {
  id: string;
  userId: string;
  exerciseType: string;
  question: { notes: string[]; root: string };
  answerGiven: string;
  correctAnswer: string;
  isCorrect: boolean;
  responseMs: number;
  createdAt: string;
}

function toEarTrainingResult(api: ApiEarTrainingResult): EarTrainingResult {
  return {
    id: api.id,
    user_id: api.userId,
    exercise_type: api.exerciseType as EarTrainingResult['exercise_type'],
    question: api.question,
    answer_given: api.answerGiven,
    correct_answer: api.correctAnswer,
    is_correct: api.isCorrect,
    response_ms: api.responseMs,
    created_at: api.createdAt,
  };
}

export class ApiEarTrainingRepository implements IEarTrainingRepository {
  async create(data: EarTrainingResult): Promise<void> {
    await apiClient.post<{ result: ApiEarTrainingResult }>('/api/ear-training', {
      exerciseType: data.exercise_type,
      question: data.question,
      answerGiven: data.answer_given,
      correctAnswer: data.correct_answer,
      isCorrect: data.is_correct,
      responseMs: data.response_ms,
    });
  }

  async getByUserId(userId: string): Promise<EarTrainingResult[]> {
    void userId; // El backend filtra por el usuario autenticado
    const { results } = await apiClient.get<{ results: ApiEarTrainingResult[] }>(
      '/api/ear-training',
      { query: { limit: 200 } },
    );
    return results.map(toEarTrainingResult);
  }

  async deleteByUserId(_userId: string): Promise<void> {
    // El backend no expone DELETE en bulk — pendiente.
    // Por ahora, los resultados persisten hasta limpieza manual desde el dashboard.
  }
}

export const apiEarTrainingRepository = new ApiEarTrainingRepository();
