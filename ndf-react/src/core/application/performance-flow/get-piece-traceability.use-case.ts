import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PieceTraceabilityReference } from '../../domain/types/performance-flow';
import { getPieceTraceability } from '../../domain/factories/performance-flow';

export class GetPieceTraceabilityUseCase {
  constructor(private readonly flowRepository: PerformanceFlowRepository) {}

  async execute(pieceId: string): Promise<PieceTraceabilityReference[]> {
    const allWorkspaces = await this.flowRepository.getAll();
    return getPieceTraceability(pieceId, allWorkspaces);
  }
}
