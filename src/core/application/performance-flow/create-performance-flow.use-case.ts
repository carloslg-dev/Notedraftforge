import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PerformanceFlow, FlowNode, FlowEdge } from '../../domain/types/performance-flow';
import { createPerformanceFlow, validateNoCircularWorkspaceDependencies } from '../../domain/factories/performance-flow';

export interface CreatePerformanceFlowInput {
  readonly id?: string;
  readonly title: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly nodes?: readonly FlowNode[];
  readonly edges?: readonly FlowEdge[];
}

export class CreatePerformanceFlowUseCase {
  constructor(private readonly flowRepository: PerformanceFlowRepository) {}

  async execute(input: CreatePerformanceFlowInput): Promise<PerformanceFlow> {
    const flow = createPerformanceFlow(input);

    const hasWorkspaceNodes = flow.nodes.some((n) => n.type === 'workspace');
    if (hasWorkspaceNodes) {
      const allWorkspaces = await this.flowRepository.getAll();
      const workspaceMap = new Map(allWorkspaces.map((w) => [w.id, w]));
      workspaceMap.set(flow.id, flow);
      validateNoCircularWorkspaceDependencies(flow, (id) => workspaceMap.get(id));
    }

    await this.flowRepository.save(flow);
    return flow;
  }
}
