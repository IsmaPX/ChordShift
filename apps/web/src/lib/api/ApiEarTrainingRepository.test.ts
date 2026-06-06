/**
 * Tests para ApiEarTrainingRepository.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient } from './client';
import { ApiEarTrainingRepository } from './ApiEarTrainingRepository';

vi.mock('./client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ApiEarTrainingRepository', () => {
  const repo = new ApiEarTrainingRepository();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('create envía los datos correctos al backend', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ result: { id: 'r1' } } as never);

    await repo.create({
      id: 'r-new',
      user_id: 'u1',
      exercise_type: 'interval',
      question: { notes: ['C', 'E'], root: 'C' },
      answer_given: 'Tercera mayor',
      correct_answer: 'Tercera mayor',
      is_correct: true,
      response_ms: 1500,
      created_at: new Date().toISOString(),
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/ear-training', {
      exerciseType: 'interval',
      question: { notes: ['C', 'E'], root: 'C' },
      answerGiven: 'Tercera mayor',
      correctAnswer: 'Tercera mayor',
      isCorrect: true,
      responseMs: 1500,
    });
  });

  it('getByUserId transforma la respuesta del backend al formato del cliente', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      results: [
        {
          id: 'r1',
          userId: 'u1',
          exerciseType: 'triad',
          question: { notes: ['C', 'E', 'G'], root: 'C' },
          answerGiven: 'Mayor',
          correctAnswer: 'Mayor',
          isCorrect: true,
          responseMs: 1200,
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
      total: 1,
      limit: 200,
      offset: 0,
    } as never);

    const results = await repo.getByUserId('u1');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: 'r1',
      user_id: 'u1',
      exercise_type: 'triad',
      is_correct: true,
      response_ms: 1200,
    });
  });
});
