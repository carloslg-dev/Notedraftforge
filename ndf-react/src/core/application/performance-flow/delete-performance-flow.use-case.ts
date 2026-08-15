import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';

export class DeletePerformanceFlowUseCase {
  constructor(private readonly flowRepository: PerformanceFlowRepository) {}

  async execute(id: string): Promise<void> {
    await this.flowRepository.delete(id);
  }
}
