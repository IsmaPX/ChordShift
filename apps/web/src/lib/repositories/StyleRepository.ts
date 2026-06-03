import type { IStyleRepository } from './interfaces'
import type { Style } from '@/types/music'
import { db } from '@/lib/db'
import { SEED_STYLES } from '@/data/styles'

export class StyleRepository implements IStyleRepository {
  async getAll(): Promise<Style[]> {
    return db.styles.orderBy('name').toArray()
  }

  async getById(id: string): Promise<Style | undefined> {
    return db.styles.get(id)
  }

  async seedIfEmpty(): Promise<void> {
    const count = await db.styles.count()
    if (count === 0) {
      await db.styles.bulkAdd(SEED_STYLES as Style[]).catch(() => {})
    }
  }
}

export const styleRepository = new StyleRepository()
