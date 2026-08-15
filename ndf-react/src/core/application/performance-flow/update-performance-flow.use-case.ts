import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PerformanceFlow, FlowNode, FlowEdge } from '../../domain/types/performance-flow';
import { createPerformanceFlow, validateNoCircularWorkspaceDependencies } from '../../domain/factories/performance-flow';

export interface UpdatePerformanceFlowInput {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly nodes?: readonly FlowNode[];
  readonly edges?: readonly FlowEdge[];
}

export class UpdatePerformanceFlowUseCase {
  constructor(private readonly flowRepository: PerformanceFlowRepository) {}

  async execute(input: UpdatePerformanceFlowInput): Promise<PerformanceFlow> {
    const existing = await this.flowRepository.getById(input.id);
    if (!existing) {
      throw new Error(`PerformanceFlow with ID '${input.id}' not found.`);
    }

    const updated = createPerformanceFlow({
      id: existing.id,
      title: input.title ?? existing.title,
      description: input.description ?? existing.description,
      tags: input.tags ?? existing.tags,
      nodes: input.nodes ?? existing.nodes,
      edges: input.edges ?? existing.edges,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    });

    const hasWorkspaceNodes = updated.nodes.some((n) => n.type === 'workspace');
    if (hasWorkspaceNodes) {
      const allWorkspaces = await this.flowRepository.getAll();
      const workspaceMap = new Map(allWorkspaces.map((w) => [w.id, w]));
      workspaceMap.set(updated.id, updated);
      validateNoCircularWorkspaceDependencies(updated, (id) => workspaceMap.get(id));
    }

    await this.flowRepository.save(updated);
    return updated;
  }
}
