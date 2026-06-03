import type { IEarTrainingRepository } from './interfaces'
import type { EarTrainingResult } from '@/lib/db'
import { db } from '@/lib/db'

export class EarTrainingRepository implements IEarTrainingRepository {
  async create(data: EarTrainingResult): Promise<void> {
    await db.ear_training_results.add(data)
  }

  async getByUserId(userId: string): Promise<EarTrainingResult[]> {
    return db.ear_training_results.where('user_id').equals(userId).toArray()
  }

  async deleteByUserId(userId: string): Promise<void> {
    const results = await this.getByUserId(userId)
    const ids = results.map((r) => r.id).filter(Boolean) as string[]
    if (ids.length > 0) {
      await db.ear_training_results.bulkDelete(ids)
    }
  }
}

export const earTrainingRepository = new EarTrainingRepository()
