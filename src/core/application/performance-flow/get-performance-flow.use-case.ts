import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PerformanceFlow } from '../../domain/types/performance-flow';

export class GetPerformanceFlowUseCase {
  constructor(private readonly flowRepository: PerformanceFlowRepository) {}

  async execute(id: string): Promise<PerformanceFlow | null> {
    return this.flowRepository.getById(id);
  }
}
