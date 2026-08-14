import { useState, useMemo } from 'react';
import type { Piece, PerformanceFlow, TagRef } from '@/core/domain/types';
import { Plus, BookOpen, Layers, GitBranch, Search } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';

interface WorkspaceLibrarySidebarProps {
  readonly pieces: readonly Piece[];
  readonly workspaces: readonly PerformanceFlow[];
  readonly currentWorkspaceId?: string;
  readonly onAddPiece: (piece: Piece) => void;
  readonly onAddWorkspace: (workspace: PerformanceFlow) => void;
  readonly onAddBranch: () => void;
  readonly traceabilityMap: Readonly<Record<string, number>>;
}

function PiecesTabContent({
  pieces,
  traceabilityMap,
  onAddPiece,
  t
}: {
  readonly pieces: readonly Piece[];
  readonly traceabilityMap: Readonly<Record<string, number>>;
  readonly onAddPiece: (p: Piece) => void;
  readonly t: (key: any) => string;
}) {
  if (pieces.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">
        {t('dragOrAddPieces')}
      </p>
    );
  }

  return (
    <>
      {pieces.map((piece) => {
        const traceCount = traceabilityMap[piece.id] ?? 0;
        return (
          <div
            key={piece.id}
            className="group flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:border-primary/50 transition-all shadow-xs"
          >
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-semibold text-foreground truncate">
                {piece.title}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {piece.type}
                </span>
                {traceCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {traceCount} {t('references')}
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddPiece(piece)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title={t('piecesTab')}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </>
  );
}

function WorkspacesTabContent({
  workspaces,
  onAddWorkspace,
  t
}: {
  readonly workspaces: readonly PerformanceFlow[];
  readonly onAddWorkspace: (w: PerformanceFlow) => void;
  readonly t: (key: any) => string;
}) {
  if (workspaces.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-6">
        {t('dragOrAddWorkspaces')}
      </p>
    );
  }

  return (
    <>
      {workspaces.map((ws) => (
        <div
          key={ws.id}
          className="group flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:border-indigo-500/50 transition-all shadow-xs"
        >
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-semibold text-foreground truncate">
              {ws.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {ws.nodes.length} nodes
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onAddWorkspace(ws)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
            title={t('workspacesTab')}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      ))}
    </>
  );
}

export function WorkspaceLibrarySidebar({
  pieces,
  workspaces,
  currentWorkspaceId,
  onAddPiece,
  onAddWorkspace,
  onAddBranch,
  traceabilityMap
}: WorkspaceLibrarySidebarProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pieces' | 'workspaces'>('pieces');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPieces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return pieces;
    return pieces.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.tags.some((tag: TagRef) => tag.value.toLowerCase().includes(query))
    );
  }, [pieces, searchQuery]);

  const filteredWorkspaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return workspaces
      .filter((w) => w.id !== currentWorkspaceId)
      .filter(
        (w) =>
          !query ||
          w.title.toLowerCase().includes(query) ||
          w.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
  }, [workspaces, currentWorkspaceId, searchQuery]);

  return (
    <aside className="w-80 border-r border-border bg-card flex flex-col h-full select-none">
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'pieces'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('pieces')}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {t('piecesTab')} ({pieces.length})
          </button>
          <button
            type="button"
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'workspaces'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('workspaces')}
          >
            <Layers className="w-3.5 h-3.5" />
            {t('workspacesTab')} ({filteredWorkspaces.length})
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-muted border border-transparent focus:border-ring focus:bg-background outline-none transition-all"
          />
        </div>

        <button
          type="button"
          onClick={onAddBranch}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium rounded-md border border-border transition-colors"
        >
          <GitBranch className="w-3.5 h-3.5" />
          {t('addBranch')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {activeTab === 'pieces' ? (
          <PiecesTabContent
            pieces={filteredPieces}
            traceabilityMap={traceabilityMap}
            onAddPiece={onAddPiece}
            t={t}
          />
        ) : (
          <WorkspacesTabContent
            workspaces={filteredWorkspaces}
            onAddWorkspace={onAddWorkspace}
            t={t}
          />
        )}
      </div>
    </aside>
  );
}
