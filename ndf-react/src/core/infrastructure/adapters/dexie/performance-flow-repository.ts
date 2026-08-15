import type { PerformanceFlow } from '../../../domain/types/';
import type { PerformanceFlowRepository } from '../../../ports';
import { db } from './db';

export class DexiePerformanceFlowRepository implements PerformanceFlowRepository {
  async getAll(): Promise<PerformanceFlow[]> {
    return db.performanceFlows.toArray();
  }

  async getById(id: string): Promise<PerformanceFlow | null> {
    const flow = await db.performanceFlows.get(id);
    return flow ?? null;
  }

  async save(flow: PerformanceFlow): Promise<void> {
    await db.performanceFlows.put(flow);
  }

  async delete(id: string): Promise<void> {
    await db.performanceFlows.delete(id);
  }
}
