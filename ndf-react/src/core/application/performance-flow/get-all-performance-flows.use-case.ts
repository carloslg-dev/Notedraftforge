import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PerformanceFlow } from '../../domain/types/performance-flow';

export class GetAllPerformanceFlowsUseCase {
  constructor(private readonly flowRepository: PerformanceFlowRepository) {}

  async execute(): Promise<PerformanceFlow[]> {
    return this.flowRepository.getAll();
  }
}
