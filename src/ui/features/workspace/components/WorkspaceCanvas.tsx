import { Fragment } from 'react';
import type { Piece, PerformanceFlow, FlowNode, PieceNode, WorkspaceNode, BranchNode } from '@/core/domain/types';
import { Trash2, ChevronUp, ChevronDown, BookOpen, Layers, GitBranch, ArrowDown } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';

interface WorkspaceCanvasProps {
  readonly nodes: readonly FlowNode[];
  readonly pieceMap: Readonly<Map<string, Piece>>;
  readonly workspaceMap: Readonly<Map<string, PerformanceFlow>>;
  readonly onRemoveNode: (nodeId: string) => void;
  readonly onMoveNode: (index: number, direction: 'up' | 'down') => void;
}

function PieceNodeCard({
  node,
  piece,
  index,
  totalNodes,
  onRemove,
  onMove
}: {
  readonly node: PieceNode;
  readonly piece?: Piece;
  readonly index: number;
  readonly totalNodes: number;
  readonly onRemove: (id: string) => void;
  readonly onMove: (idx: number, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="relative flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {piece ? piece.title : `Piece (${node.pieceId})`}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {piece?.type ? `Type: ${piece.type}` : 'Piece Entity'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(index, 'up')}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          aria-label="Move node up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={index === totalNodes - 1}
          onClick={() => onMove(index, 'down')}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          aria-label="Move node down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(node.id)}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors ml-1"
          aria-label="Delete node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function WorkspaceNodeCard({
  node,
  workspace,
  index,
  totalNodes,
  onRemove,
  onMove
}: {
  readonly node: WorkspaceNode;
  readonly workspace?: PerformanceFlow;
  readonly index: number;
  readonly totalNodes: number;
  readonly onRemove: (id: string) => void;
  readonly onMove: (idx: number, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="relative flex items-center justify-between p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
          <Layers className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
            {workspace ? workspace.title : `Workspace (${node.workspaceId})`}
          </h4>
          <p className="text-xs text-indigo-600/80 dark:text-indigo-400 mt-0.5">
            Nested Workspace ({workspace?.nodes.length ?? 0} child nodes)
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(index, 'up')}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          aria-label="Move workspace up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={index === totalNodes - 1}
          onClick={() => onMove(index, 'down')}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          aria-label="Move workspace down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(node.id)}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors ml-1"
          aria-label="Delete workspace node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function BranchNodeCard({
  node,
  index,
  totalNodes,
  onRemove,
  onMove
}: {
  readonly node: BranchNode;
  readonly index: number;
  readonly totalNodes: number;
  readonly onRemove: (id: string) => void;
  readonly onMove: (idx: number, dir: 'up' | 'down') => void;
}) {
  return (
    <div className="relative flex items-center justify-between p-4 rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30 shadow-xs hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-800 dark:text-amber-200 font-semibold text-xs">
          <GitBranch className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-amber-950 dark:text-amber-200">
            {node.label || 'Decision Branch'}
          </h4>
          <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-0.5">
            Interactive decision point during audition
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(index, 'up')}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          aria-label="Move branch up"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={index === totalNodes - 1}
          onClick={() => onMove(index, 'down')}
          className="p-1.5 rounded text-muted-foreground hover:text-foreground disabled:opacity-30 transition-opacity"
          aria-label="Move branch down"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(node.id)}
          className="p-1.5 rounded text-muted-foreground hover:text-destructive transition-colors ml-1"
          aria-label="Delete branch node"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function WorkspaceCanvas({
  nodes,
  pieceMap,
  workspaceMap,
  onRemoveNode,
  onMoveNode
}: WorkspaceCanvasProps) {
  const { t } = useTranslation();

  if (nodes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
          <BookOpen className="w-8 h-8 opacity-40" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {t('readingSurfaceEmpty')}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {t('dragOrAddPieces')}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full space-y-4">
      {nodes.map((node, index) => (
        <Fragment key={node.id}>
          {index > 0 && (
            <div className="flex justify-center my-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-[11px] text-muted-foreground font-mono">
                <ArrowDown className="w-3 h-3" />
                <span>Next</span>
              </div>
            </div>
          )}

          {node.type === 'piece' && (
            <PieceNodeCard
              node={node as PieceNode}
              piece={pieceMap.get((node as PieceNode).pieceId)}
              index={index}
              totalNodes={nodes.length}
              onRemove={onRemoveNode}
              onMove={onMoveNode}
            />
          )}

          {node.type === 'workspace' && (
            <WorkspaceNodeCard
              node={node as WorkspaceNode}
              workspace={workspaceMap.get((node as WorkspaceNode).workspaceId)}
              index={index}
              totalNodes={nodes.length}
              onRemove={onRemoveNode}
              onMove={onMoveNode}
            />
          )}

          {node.type === 'branch' && (
            <BranchNodeCard
              node={node as BranchNode}
              index={index}
              totalNodes={nodes.length}
              onRemove={onRemoveNode}
              onMove={onMoveNode}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
