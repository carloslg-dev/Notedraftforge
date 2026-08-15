import type {
  PerformanceFlow,
  FlowNode,
  FlowEdge,
  PieceNode,
  WorkspaceNode,
  PieceTraceabilityReference,
  CompiledReadingItem,
  Piece,
  PieceContent
} from '../types';
import { randomUUID } from '../uuid';

export interface CreatePerformanceFlowParams {
  readonly id?: string;
  readonly title: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly nodes?: readonly FlowNode[];
  readonly edges?: readonly FlowEdge[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

function validateFlowTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error('PerformanceFlow title cannot be empty.');
  }
  return trimmed;
}

function validateNodeUniqueness(nodes: readonly FlowNode[]): void {
  const seenIds = new Set<string>();
  for (const node of nodes) {
    if (seenIds.has(node.id)) {
      throw new Error(`Duplicate node ID found in PerformanceFlow: ${node.id}`);
    }
    seenIds.add(node.id);
  }
}

function validateEdgeConnections(edges: readonly FlowEdge[], nodes: readonly FlowNode[]): void {
  const nodeIds = new Set(nodes.map((n) => n.id));
  for (const edge of edges) {
    if (!nodeIds.has(edge.sourceNodeId)) {
      throw new Error(`Edge source node '${edge.sourceNodeId}' does not exist in flow nodes.`);
    }
    if (!nodeIds.has(edge.targetNodeId)) {
      throw new Error(`Edge target node '${edge.targetNodeId}' does not exist in flow nodes.`);
    }
  }
}

export function createPerformanceFlow(params: CreatePerformanceFlowParams): PerformanceFlow {
  const title = validateFlowTitle(params.title);
  const nodes = params.nodes ?? [];
  const edges = params.edges ?? [];

  validateNodeUniqueness(nodes);
  validateEdgeConnections(edges, nodes);

  const now = new Date().toISOString();
  const desc = params.description?.trim();

  return {
    id: params.id ?? randomUUID(),
    title,
    description: desc && desc.length > 0 ? desc : undefined,
    tags: (params.tags ?? []).map((t) => t.trim().toLowerCase()).filter(Boolean),
    nodes,
    edges,
    createdAt: params.createdAt ?? now,
    updatedAt: params.updatedAt ?? now
  };
}

export function validateNoCircularWorkspaceDependencies(
  rootFlow: PerformanceFlow,
  getWorkspaceById: (id: string) => PerformanceFlow | undefined
): void {
  function checkCycle(currentFlow: PerformanceFlow, visitedPath: string[]): void {
    if (visitedPath.includes(currentFlow.id)) {
      const chain = [...visitedPath, currentFlow.id].join(' -> ');
      throw new Error(`Circular workspace reference detected: ${chain}`);
    }

    const nextVisited = [...visitedPath, currentFlow.id];
    for (const node of currentFlow.nodes) {
      if (node.type === 'workspace') {
        const childWorkspace = getWorkspaceById(node.workspaceId);
        if (childWorkspace) {
          checkCycle(childWorkspace, nextVisited);
        }
      }
    }
  }

  checkCycle(rootFlow, []);
}

function findPiecePathsInWorkspace(
  targetPieceId: string,
  rootWorkspace: PerformanceFlow,
  currentWorkspace: PerformanceFlow,
  workspaceMap: Map<string, PerformanceFlow>,
  currentPath: string[],
  results: PieceTraceabilityReference[],
  visitedIds: Set<string>
): void {
  if (visitedIds.has(currentWorkspace.id)) return;
  visitedIds.add(currentWorkspace.id);

  const newPath = [...currentPath, currentWorkspace.title];

  const hasDirectPiece = currentWorkspace.nodes.some(
    (n) => n.type === 'piece' && (n as PieceNode).pieceId === targetPieceId
  );

  if (hasDirectPiece) {
    results.push({
      workspaceId: rootWorkspace.id,
      workspaceTitle: rootWorkspace.title,
      path: newPath
    });
  }

  for (const node of currentWorkspace.nodes) {
    if (node.type === 'workspace') {
      const child = workspaceMap.get(node.workspaceId);
      if (child) {
        findPiecePathsInWorkspace(targetPieceId, rootWorkspace, child, workspaceMap, newPath, results, new Set(visitedIds));
      }
    }
  }
}

export function getPieceTraceability(
  pieceId: string,
  allWorkspaces: readonly PerformanceFlow[]
): PieceTraceabilityReference[] {
  const workspaceMap = new Map(allWorkspaces.map((w) => [w.id, w]));
  const results: PieceTraceabilityReference[] = [];

  for (const workspace of allWorkspaces) {
    findPiecePathsInWorkspace(pieceId, workspace, workspace, workspaceMap, [], results, new Set());
  }

  const seenKeys = new Set<string>();
  return results.filter((ref) => {
    const key = `${ref.workspaceId}:${ref.path.join('/')}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });
}

function getNextNodeId(
  currentNode: FlowNode,
  edges: readonly FlowEdge[],
  selectedDecisions?: Readonly<Record<string, string>>
): string | null {
  const outgoing = edges.filter((e) => e.sourceNodeId === currentNode.id);
  if (outgoing.length === 0) return null;

  if (currentNode.type === 'branch' && selectedDecisions) {
    const chosenEdgeId = selectedDecisions[currentNode.id];
    if (chosenEdgeId) {
      const chosenEdge = outgoing.find((e) => e.id === chosenEdgeId || e.targetNodeId === chosenEdgeId);
      if (chosenEdge) return chosenEdge.targetNodeId;
    }
  }

  const primaryEdge = outgoing.find((e) => e.isPrimary);
  return primaryEdge?.targetNodeId ?? outgoing[0].targetNodeId;
}

export interface CompileFlowOptions {
  readonly flow: PerformanceFlow;
  readonly getPieceById: (id: string) => Piece | undefined;
  readonly getWorkspaceById: (id: string) => PerformanceFlow | undefined;
  readonly selectedDecisions?: Readonly<Record<string, string>>;
  readonly breadcrumb?: readonly string[];
  readonly visitedWorkspaces?: ReadonlySet<string>;
}

function resolvePieceContent(content: PieceContent, blockId?: string): PieceContent {
  if (!blockId || content.kind !== 'text') {
    return content;
  }
  const matchedBlock = content.blocks.find((b) => b.id === blockId);
  return {
    kind: 'text',
    blocks: matchedBlock ? [matchedBlock] : content.blocks
  };
}

function createCompiledPieceItem(
  node: PieceNode,
  piece: Piece,
  breadcrumb: readonly string[]
): CompiledReadingItem {
  return {
    nodeId: node.id,
    pieceId: piece.id,
    pieceTitle: piece.title,
    blockId: node.blockId,
    content: resolvePieceContent(piece.content, node.blockId),
    workspaceBreadcrumb: breadcrumb
  };
}

function compilePieceNode(
  node: PieceNode,
  getPieceById: (id: string) => Piece | undefined,
  breadcrumb: readonly string[]
): CompiledReadingItem[] {
  const piece = getPieceById(node.pieceId);
  if (!piece) return [];
  return [createCompiledPieceItem(node, piece, breadcrumb)];
}

function compileWorkspaceNode(
  node: WorkspaceNode,
  options: CompileFlowOptions,
  updatedVisited: Set<string>,
  breadcrumb: readonly string[]
): CompiledReadingItem[] {
  const nested = options.getWorkspaceById(node.workspaceId);
  if (!nested) return [];
  return compileFlowToReadingSurface({
    flow: nested,
    getPieceById: options.getPieceById,
    getWorkspaceById: options.getWorkspaceById,
    selectedDecisions: options.selectedDecisions,
    breadcrumb,
    visitedWorkspaces: updatedVisited
  });
}

function compileSingleNode(
  node: FlowNode,
  options: CompileFlowOptions,
  updatedVisited: Set<string>,
  breadcrumb: readonly string[]
): CompiledReadingItem[] {
  if (node.type === 'piece') {
    return compilePieceNode(node as PieceNode, options.getPieceById, breadcrumb);
  }
  if (node.type === 'workspace') {
    return compileWorkspaceNode(node as WorkspaceNode, options, updatedVisited, breadcrumb);
  }
  return [];
}

export function compileFlowToReadingSurface(options: CompileFlowOptions): CompiledReadingItem[] {
  const { flow, selectedDecisions, breadcrumb = [], visitedWorkspaces = new Set() } = options;

  if (visitedWorkspaces.has(flow.id)) {
    throw new Error(`Circular workspace reference detected during compilation: ${flow.id}`);
  }

  const updatedVisited = new Set(visitedWorkspaces);
  updatedVisited.add(flow.id);
  const currentBreadcrumb = [...breadcrumb, flow.title];

  const nodeMap = new Map(flow.nodes.map((n) => [n.id, n]));
  const incomingSources = new Set(flow.edges.map((e) => e.targetNodeId));
  const startNodes = flow.nodes.filter((n) => !incomingSources.has(n.id));

  const items: CompiledReadingItem[] = [];
  const visitedNodeIds = new Set<string>();

  const traverseNode = (nodeId: string | null): void => {
    if (!nodeId || visitedNodeIds.has(nodeId)) return;
    visitedNodeIds.add(nodeId);

    const node = nodeMap.get(nodeId);
    if (!node) return;

    const nodeItems = compileSingleNode(node, options, updatedVisited, currentBreadcrumb);
    items.push(...nodeItems);

    const nextId = getNextNodeId(node, flow.edges, selectedDecisions);
    traverseNode(nextId);
  };

  const initialNodes = startNodes.length > 0 ? startNodes : flow.nodes.slice(0, 1);
  for (const startNode of initialNodes) {
    traverseNode(startNode.id);
  }

  return items;
}
