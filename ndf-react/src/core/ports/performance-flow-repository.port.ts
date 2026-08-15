import type { PerformanceFlow } from '../domain/types/';

export interface PerformanceFlowRepository {
  getAll(): Promise<PerformanceFlow[]>;
  getById(id: string): Promise<PerformanceFlow | null>;
  save(flow: PerformanceFlow): Promise<void>;
  delete(id: string): Promise<void>;
}
