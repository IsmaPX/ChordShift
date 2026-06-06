/**
 * ApiStyleRepository — catálogo público de estilos desde el backend.
 */

import type { IStyleRepository } from '../interfaces';
import type { Style } from '@/types/music';
import { apiClient } from '@/lib/api/client';
import type { CatalogStylesResponse } from '@/lib/api/types';

export class ApiStyleRepository implements IStyleRepository {
  async getAll(): Promise<Style[]> {
    const { styles } = await apiClient.get<CatalogStylesResponse>('/api/catalog/styles');
    return styles;
  }

  async getById(id: string): Promise<Style | undefined> {
    const all = await this.getAll();
    return all.find((s) => s.id === id);
  }

  async seedIfEmpty(): Promise<void> {
    // El seed se ejecuta en el backend (`pnpm db:seed`)
  }
}

export const apiStyleRepository = new ApiStyleRepository();
