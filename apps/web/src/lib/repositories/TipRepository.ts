import type { ITipRepository } from './interfaces'
import type { Tip } from '@/types/music'
import { db } from '@/lib/db'
import { SEED_TIPS } from '@/data/tips'

export class TipRepository implements ITipRepository {
  async getAll(): Promise<Tip[]> {
    return db.tips.toArray()
  }

  async getById(id: string): Promise<Tip | undefined> {
    return db.tips.get(id)
  }

  async seedIfEmpty(): Promise<void> {
    const count = await db.tips.count()
    if (count === 0) {
      await db.tips.bulkAdd(SEED_TIPS as Tip[]).catch(() => {})
    }
  }
}

export const tipRepository = new TipRepository()
