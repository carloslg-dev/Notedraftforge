import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PieceRepository } from '../../ports/piece-repository';
import type { CompiledReadingItem } from '../../domain/types/performance-flow';
import { compileFlowToReadingSurface } from '../../domain/factories/performance-flow';

export class CompilePerformanceFlowUseCase {
  constructor(
    private readonly flowRepository: PerformanceFlowRepository,
    private readonly pieceRepository: PieceRepository
  ) {}

  async execute(flowId: string, selectedDecisions?: Record<string, string>): Promise<CompiledReadingItem[]> {
    const rootFlow = await this.flowRepository.getById(flowId);
    if (!rootFlow) {
      throw new Error(`PerformanceFlow with ID '${flowId}' not found.`);
    }

    const allWorkspaces = await this.flowRepository.getAll();
    const workspaceMap = new Map(allWorkspaces.map((w) => [w.id, w]));

    const allPieces = await this.pieceRepository.getAll();
    const pieceMap = new Map(allPieces.map((p) => [p.id, p]));

    return compileFlowToReadingSurface({
      flow: rootFlow,
      getPieceById: (id) => pieceMap.get(id),
      getWorkspaceById: (id) => workspaceMap.get(id),
      selectedDecisions
    });
  }
}
