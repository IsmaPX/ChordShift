/**
 * ApiTipRepository — tips desde el backend (catálogo público).
 */

import type { ITipRepository } from '@/lib/repositories/interfaces';
import type { Tip } from '@/types/music';
import { apiClient } from '@/lib/api/client';
import type { CatalogTipsResponse } from '@/lib/api/types';

export class ApiTipRepository implements ITipRepository {
  async getAll(): Promise<Tip[]> {
    const { tips } = await apiClient.get<CatalogTipsResponse>('/api/catalog/tips');
    return tips;
  }

  async getById(id: string): Promise<Tip | undefined> {
    const all = await this.getAll();
    return all.find((t) => t.id === id);
  }

  async seedIfEmpty(): Promise<void> {
    // No-op
  }
}

export const apiTipRepository = new ApiTipRepository();
