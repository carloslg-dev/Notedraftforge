import type { PieceContent } from './piece';

export type FlowNodeType = 'piece' | 'workspace' | 'branch';

export interface NodePosition {
  readonly x: number;
  readonly y: number;
}

export interface PieceNode {
  readonly id: string;
  readonly type: 'piece';
  readonly pieceId: string;
  readonly blockId?: string;
  readonly position?: NodePosition;
}

export interface WorkspaceNode {
  readonly id: string;
  readonly type: 'workspace';
  readonly workspaceId: string;
  readonly position?: NodePosition;
}

export interface BranchNode {
  readonly id: string;
  readonly type: 'branch';
  readonly label: string;
  readonly position?: NodePosition;
}

export type FlowNode = PieceNode | WorkspaceNode | BranchNode;

export interface FlowEdge {
  readonly id: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly label?: string;
  readonly isPrimary?: boolean;
}

export interface PerformanceFlow {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly tags: readonly string[];
  readonly nodes: readonly FlowNode[];
  readonly edges: readonly FlowEdge[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PieceTraceabilityReference {
  readonly workspaceId: string;
  readonly workspaceTitle: string;
  readonly path: readonly string[];
}

export interface CompiledReadingItem {
  readonly nodeId: string;
  readonly pieceId: string;
  readonly pieceTitle: string;
  readonly blockId?: string;
  readonly content: PieceContent;
  readonly workspaceBreadcrumb: readonly string[];
}
