import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, GitBranch, Sparkles } from 'lucide-react';
import { useTranslation } from '@/ui/hooks/use-translation';
import { useWorkspaces } from './use-workspaces';
import { useWorkList } from '@/ui/features/work-list/use-work-list';
import { compileFlowToReadingSurface } from '@/core/domain/factories/performance-flow';
import type { PerformanceFlow, CompiledReadingItem, PieceContent, TextBlock, TextRun, FlowNode, FlowEdge } from '@/core/domain/types';
import { Button } from '@/ui/components/ui/button';

function RenderReadingBlock({ block }: { readonly block: TextBlock }) {
  if (block.kind === 'paragraph') {
    return (
      <p className="text-base md:text-lg leading-relaxed text-foreground/90 my-2">
        {block.runs.map((r: TextRun) => r.text).join('')}
      </p>
    );
  }
  if (block.kind === 'heading') {
    return (
      <h3 className="text-lg md:text-xl font-semibold text-foreground mt-4 mb-2">
        {block.runs.map((r: TextRun) => r.text).join('')}
      </h3>
    );
  }
  if (block.kind === 'line') {
    return (
      <p className="text-base md:text-lg leading-relaxed font-serif tracking-wide text-foreground/95 my-1">
        {block.runs.map((r: TextRun) => r.text).join('')}
      </p>
    );
  }
  if (block.kind === 'quote') {
    return (
      <blockquote className="border-l-4 border-muted-foreground/40 pl-4 italic text-muted-foreground my-3">
        {block.runs.map((r: TextRun) => r.text).join('')}
      </blockquote>
    );
  }
  return null;
}

function RenderPieceReadingContent({ content }: { readonly content: PieceContent }) {
  if (content.kind === 'text' || content.kind === 'poem') {
    return (
      <div className="space-y-1">
        {content.blocks.map((block: TextBlock) => (
          <RenderReadingBlock key={block.id} block={block} />
        ))}
      </div>
    );
  }
  return (
    <p className="text-sm text-muted-foreground italic">
      Contenido de canción reservado para MVP2
    </p>
  );
}

export function AuditionPage() {
  const { flowId } = useParams<{ flowId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pieces } = useWorkList();
  const { workspaces } = useWorkspaces();

  const [currentFlow, setCurrentFlow] = useState<PerformanceFlow | null>(null);
  const [selectedDecisions, setSelectedDecisions] = useState<Record<string, string>>({});

  useEffect(() => {
    if (flowId && workspaces.length > 0) {
      const found = workspaces.find((w) => w.id === flowId);
      if (found) {
        setCurrentFlow(found);
      }
    }
  }, [flowId, workspaces]);

  const pieceMap = useMemo(() => new Map(pieces.map((p) => [p.id, p])), [pieces]);
  const workspaceMap = useMemo(() => new Map(workspaces.map((w) => [w.id, w])), [workspaces]);

  const compiledItems: CompiledReadingItem[] = useMemo(() => {
    if (!currentFlow) return [];
    try {
      return compileFlowToReadingSurface({
        flow: currentFlow,
        getPieceById: (id) => pieceMap.get(id),
        getWorkspaceById: (id) => workspaceMap.get(id),
        selectedDecisions
      });
    } catch (err) {
      console.error('Compilation error during audition:', err);
      return [];
    }
  }, [currentFlow, pieceMap, workspaceMap, selectedDecisions]);

  const branchNodes = useMemo(() => {
    if (!currentFlow) return [];
    return currentFlow.nodes.filter((n: FlowNode) => n.type === 'branch');
  }, [currentFlow]);

  const handleSelectDecision = useCallback((branchNodeId: string, edgeIdOrTarget: string) => {
    setSelectedDecisions((prev) => ({
      ...prev,
      [branchNodeId]: edgeIdOrTarget
    }));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-zinc-950 text-foreground">
      {/* Audition Header */}
      <header className="sticky top-0 z-20 h-14 border-b border-border px-4 md:px-8 flex items-center justify-between bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/workspace/${flowId}`)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={t('exitAudition')}
            aria-label={t('exitAudition')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm md:text-base font-semibold text-foreground flex items-center gap-2">
              {currentFlow?.title ?? 'Audición en Vivo'}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-mono uppercase tracking-wider">
                Recital Live
              </span>
            </h2>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(`/workspace/${flowId}`)}
          className="text-xs font-medium"
        >
          {t('exitAudition')}
        </Button>
      </header>

      {/* Decision Points Bar (if any branch nodes exist) */}
      {branchNodes.length > 0 && currentFlow && (
        <div className="bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 px-4 py-3">
          <div className="max-w-2xl mx-auto flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <GitBranch className="w-4 h-4" />
              <span>{t('decisionPoint')}s en Vivo:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {branchNodes.map((node: FlowNode) => {
                const outgoing = currentFlow.edges.filter((e: FlowEdge) => e.sourceNodeId === node.id);
                return (
                  <div
                    key={node.id}
                    className="flex items-center gap-2 bg-background p-2 rounded-lg border border-amber-200 dark:border-amber-800 text-xs shadow-xs"
                  >
                    <span className="font-medium text-foreground">
                      {(node as any).label}:
                    </span>
                    <div className="flex gap-1">
                      {outgoing.map((edge: FlowEdge, idx: number) => {
                        const isChosen =
                          selectedDecisions[node.id] === edge.id ||
                          (!selectedDecisions[node.id] && (edge.isPrimary || idx === 0));
                        return (
                          <button
                            key={edge.id}
                            type="button"
                            onClick={() => handleSelectDecision(node.id, edge.id)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                              isChosen
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {edge.label || `Opción ${idx + 1}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Continuous Reading Surface */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-12">
        {compiledItems.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            {t('readingSurfaceEmpty')}
          </div>
        ) : (
          compiledItems.map((item: CompiledReadingItem, idx: number) => (
            <article
              key={`${item.nodeId}-${idx}`}
              className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-xs hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary text-xs">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {item.pieceTitle}
                  </h3>
                </div>

                {item.workspaceBreadcrumb.length > 1 && (
                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                    <Layers className="w-3 h-3 text-indigo-500" />
                    <span>{item.workspaceBreadcrumb.join(' › ')}</span>
                  </div>
                )}
              </div>

              <RenderPieceReadingContent content={item.content} />
            </article>
          ))
        )}

        <div className="text-center py-8 text-xs text-muted-foreground flex items-center justify-center gap-2 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Fin del flujo de audición</span>
        </div>
      </main>
    </div>
  );
}
