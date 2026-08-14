import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Save, Check, Trash2 } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';
import { useWorkspaces } from './use-workspaces';
import { useWorkList } from '@/ui/features/work-list/use-work-list';
import { WorkspaceLibrarySidebar } from './components/WorkspaceLibrarySidebar';
import { WorkspaceCanvas } from './components/WorkspaceCanvas';
import { CreateWorkspaceModal } from './components/CreateWorkspaceModal';
import type { FlowNode, FlowEdge, Piece, PerformanceFlow } from '@/core/domain/types';
import { randomUUID } from '@/core/domain/uuid';
import { Button } from '@/ui/components/ui/button';

function getSaveLabel(isSaving: boolean, saveSuccess: boolean, t: (key: any) => string): string {
  if (isSaving) return t('saving');
  if (saveSuccess) return t('flowSaved');
  return t('save');
}

export function WorkspacePage() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pieces } = useWorkList();
  const { workspaces, updateWorkspace, deleteWorkspace, getTraceability } = useWorkspaces();

  const [currentFlow, setCurrentFlow] = useState<PerformanceFlow | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [traceabilityMap, setTraceabilityMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (flowId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === flowId);
      if (found) {
        setCurrentFlow(found);
        setNodes([...found.nodes]);
        setEdges([...found.edges]);
        setTitle(found.title);
      }
    }
  }, [flowId, workspaces]);

  // Load traceability reference counts for all pieces
  useEffect(() => {
    if (pieces.length === 0) return;
    const fetchTraceability = async () => {
      const map: Record<string, number> = {};
      for (const p of pieces) {
        const trace = await getTraceability(p.id);
        map[p.id] = trace.length;
      }
      setTraceabilityMap(map);
    };
    fetchTraceability();
  }, [pieces, getTraceability, workspaces]);

  const pieceMap = useMemo(() => new Map(pieces.map((p) => [p.id, p])), [pieces]);
  const workspaceMap = useMemo(() => new Map(workspaces.map((w) => [w.id, w])), [workspaces]);

  const handleAddPiece = useCallback((piece: Piece) => {
    const newNode: FlowNode = {
      id: randomUUID(),
      type: 'piece',
      pieceId: piece.id
    };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      if (prev.length > 0) {
        const newEdge: FlowEdge = {
          id: randomUUID(),
          sourceNodeId: prev[prev.length - 1].id,
          targetNodeId: newNode.id,
          isPrimary: true
        };
        setEdges((edgePrev) => [...edgePrev, newEdge]);
      }
      return updated;
    });
  }, []);

  const handleAddWorkspace = useCallback((ws: PerformanceFlow) => {
    const newNode: FlowNode = {
      id: randomUUID(),
      type: 'workspace',
      workspaceId: ws.id
    };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      if (prev.length > 0) {
        const newEdge: FlowEdge = {
          id: randomUUID(),
          sourceNodeId: prev[prev.length - 1].id,
          targetNodeId: newNode.id,
          isPrimary: true
        };
        setEdges((edgePrev) => [...edgePrev, newEdge]);
      }
      return updated;
    });
  }, []);

  const handleAddBranch = useCallback(() => {
    const question = window.prompt(t('branchLabel'), '¿Repetir estribillo?');
    if (!question?.trim()) return;

    const newNode: FlowNode = {
      id: randomUUID(),
      type: 'branch',
      label: question.trim()
    };
    setNodes((prev) => {
      const updated = [...prev, newNode];
      if (prev.length > 0) {
        const newEdge: FlowEdge = {
          id: randomUUID(),
          sourceNodeId: prev[prev.length - 1].id,
          targetNodeId: newNode.id,
          isPrimary: true
        };
        setEdges((edgePrev) => [...edgePrev, newEdge]);
      }
      return updated;
    });
  }, [t]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId));
  }, []);

  const handleMoveNode = useCallback((index: number, direction: 'up' | 'down') => {
    setNodes((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }, []);

  const handleSave = async () => {
    if (!currentFlow || isSaving) return;
    try {
      setIsSaving(true);
      await updateWorkspace({
        id: currentFlow.id,
        title: title.trim() || currentFlow.title,
        nodes,
        edges
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save workspace');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentFlow) return;
    if (window.confirm(t('confirmDeleteWorkspace'))) {
      await deleteWorkspace(currentFlow.id);
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-border px-4 flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={t('goBackWorks')}
            aria-label={t('goBackWorks')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Workspace title..."
            className="text-base font-semibold bg-transparent border-none outline-none focus:ring-1 focus:ring-ring rounded px-1.5 py-0.5 max-w-sm truncate text-foreground"
          />

          {currentFlow?.tags && currentFlow.tags.length > 0 && (
            <div className="hidden sm:flex items-center gap-1">
              {currentFlow.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title={t('deleteWorkspace')}
            aria-label={t('deleteWorkspace')}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 text-xs"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Save className="w-3.5 h-3.5" />}
            {getSaveLabel(isSaving, saveSuccess, t)}
          </Button>

          {currentFlow && (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(`/workspace/${currentFlow.id}/audition`)}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <Play className="w-3.5 h-3.5" />
              {t('auditionMode')}
            </Button>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex flex-1 overflow-hidden">
        <WorkspaceLibrarySidebar
          pieces={pieces}
          workspaces={workspaces}
          currentWorkspaceId={currentFlow?.id}
          onAddPiece={handleAddPiece}
          onAddWorkspace={handleAddWorkspace}
          onAddBranch={handleAddBranch}
          traceabilityMap={traceabilityMap}
        />

        <main className="flex-1 flex flex-col bg-muted/20 overflow-y-auto">
          <WorkspaceCanvas
            nodes={nodes}
            pieceMap={pieceMap}
            workspaceMap={workspaceMap}
            onRemoveNode={handleRemoveNode}
            onMoveNode={handleMoveNode}
          />
        </main>
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newId) => navigate(`/workspace/${newId}`)}
      />
    </div>
  );
}
