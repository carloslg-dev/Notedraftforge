import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useWorkView } from './use-work-view';
import { useUIStore } from '../../state/ui-store';
import { useTranslation } from '@/ui/hooks/use-translation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Lightbulb, MessageSquare, Wind } from 'lucide-react';
import { TiptapEditor } from '../../../core/infrastructure/editor/components/TiptapEditor';
import { PieceContent } from '../../../core/domain/types/';
import { AutosavePieceUseCase } from '../../../core/application/piece-management/autosave-piece.use-case';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';
import { toast } from 'sonner';
import { RefineSelectionModal } from './components/RefineSelectionModal';
import { useMediaQuery } from '@/ui/hooks/use-media-query';

function renderBaseContent(content: PieceContent) {
  if (content.kind === 'song') {
    return <p className="text-[#80868b]">Song visualization is not supported in MVP.</p>;
  }

  return (
    <div className="space-y-4 font-serif leading-relaxed text-[#202124] select-text">
      {content.blocks.map((block) => {
        const renderedRuns = block.runs.map((run) => {
          let classes = '';
          if (run.marks?.includes('bold')) classes += ' font-bold';
          if (run.marks?.includes('italic')) classes += ' italic';
          if (run.marks?.includes('underline')) classes += ' underline';

          return (
            <span key={run.id} className={classes}>
              {run.text}
            </span>
          );
        });

        switch (block.kind) {
          case 'heading':
            return (
              <h2 key={block.id} className="text-xl font-bold tracking-tight text-[#202124] mt-6 mb-2">
                {renderedRuns}
              </h2>
            );
          case 'quote':
            return (
              <blockquote key={block.id} className="border-l-4 border-[#dadce0] pl-4 italic text-[#5f6368] my-4">
                {renderedRuns}
              </blockquote>
            );
          case 'line':
            return (
              <div key={block.id} className="min-h-[1.5rem] select-text">
                {renderedRuns.length > 0 ? renderedRuns : <br />}
              </div>
            );
          case 'paragraph':
          default:
            return (
              <p key={block.id} className="min-h-[1.5rem] select-text">
                {renderedRuns.length > 0 ? renderedRuns : <br />}
              </p>
            );
        }
      })}
    </div>
  );
}

function getRangeOffsetsRelativeToElement(element: HTMLElement, range: Range) {
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(element);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;
  const end = start + range.toString().length;
  return { start, end };
}

function setRangeOffsetsRelativeToElement(element: HTMLElement, start: number, end: number) {
  const range = document.createRange();
  let charCount = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textLen = node.textContent?.length || 0;
      const nextCount = charCount + textLen;
      if (!startNode && start >= charCount && start <= nextCount) {
        startNode = node;
        startOffset = start - charCount;
      }
      if (!endNode && end >= charCount && end <= nextCount) {
        endNode = node;
        endOffset = end - charCount;
      }
      charCount = nextCount;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverse(node.childNodes[i]);
        if (startNode && endNode) break;
      }
    }
  }

  traverse(element);

  if (startNode && endNode) {
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

export function WorkViewPage() {
  const { pieceId } = useParams<{ pieceId: string }>();
  const { piece, loading, error, refresh } = useWorkView(pieceId);
  const { activeMode, enterEditing, enterVisualization } = useUIStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [selectionRect, setSelectionRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [refineStart, setRefineStart] = useState(0);
  const [refineEnd, setRefineEnd] = useState(0);
  const [showMobileToolbar, setShowMobileToolbar] = useState(false);

  const hasSelectionMobile = !!selectionRect && !!selectedText;

  useEffect(() => {
    if (hasSelectionMobile) {
      setShowMobileToolbar(true);
    } else {
      const timer = setTimeout(() => {
        setShowMobileToolbar(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSelectionMobile]);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (activeMode !== 'visualization') {
        setSelectionRect(null);
        setSelectedText('');
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setSelectionRect(null);
        setSelectedText('');
        return;
      }

      const range = selection.getRangeAt(0);
      const container = document.querySelector('.visualization-view');
      if (!container || !container.contains(range.commonAncestorContainer)) {
        setSelectionRect(null);
        setSelectedText('');
        return;
      }

      const rect = range.getBoundingClientRect();
      setSelectionRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
      setSelectedText(selection.toString().trim());
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [activeMode]);

  const pendingContentRef = useRef<PieceContent | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerAutosave = useCallback(async (contentToSave: PieceContent) => {
    if (!pieceId) return;
    try {
      const repository = new DexiePieceRepository();
      const useCase = new AutosavePieceUseCase(repository);
      await useCase.execute({
        pieceId,
        content: contentToSave
      });
    } catch (err) {
      console.error('Autosave failed:', err);
      toast.error('Failed to autosave changes: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [pieceId]);

  const flushAutosave = useCallback(async () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (pendingContentRef.current) {
      const content = pendingContentRef.current;
      pendingContentRef.current = null;
      await triggerAutosave(content);
    }
  }, [triggerAutosave]);

  useEffect(() => {
    return () => {
      // Flush pending content immediately on unmount/exit
      if (pendingContentRef.current) {
        const content = pendingContentRef.current;
        const repository = new DexiePieceRepository();
        const useCase = new AutosavePieceUseCase(repository);
        if (pieceId) {
          useCase.execute({ pieceId, content }).catch(console.error);
        }
      }
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      enterVisualization().catch(console.error);
    };
  }, [enterVisualization, pieceId]);

  const handleUpdate = (newContent: PieceContent) => {
    pendingContentRef.current = newContent;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      if (pendingContentRef.current) {
        const content = pendingContentRef.current;
        pendingContentRef.current = null;
        triggerAutosave(content);
      }
    }, 5000);
  };

  const handleAnnotationClick = (kind: string) => {
    toast.info(`Annotation: ${kind} for "${selectedText}"`);
  };

  const handleRefineClick = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const blockElement = range.commonAncestorContainer.parentElement?.closest('p, h2, blockquote, div');
    if (!blockElement) return;

    const blockText = blockElement.textContent || '';
    const { start, end } = getRangeOffsetsRelativeToElement(blockElement as HTMLElement, range);

    setRefineText(blockText);
    setRefineStart(start);
    setRefineEnd(end);
    setIsRefineOpen(true);
  };

  const handleRefineConfirm = (newStart: number, newEnd: number) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const blockElement = range.commonAncestorContainer.parentElement?.closest('p, h2, blockquote, div');
    if (!blockElement) return;

    setRangeOffsetsRelativeToElement(blockElement as HTMLElement, newStart, newEnd);
  };

  const handleBackClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (activeMode === 'editing') {
      await flushAutosave();
    }
    navigate('/');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col gap-4 p-8 items-center justify-center bg-[#f8f9fa]">
        <p className="text-[#5f6368] text-sm">{t('loadingWorks')}</p>
      </main>
    );
  }

  if (error || !piece) {
    return (
      <main className="flex min-h-screen flex-col gap-4 p-8 items-center justify-center bg-[#f8f9fa]">
        <h1 className="text-2xl font-semibold tracking-tight text-[#202124]">{t('pieceNotFound')}</h1>
        <p className="text-[#5f6368] text-sm">{t('pieceNotFoundDesc')}</p>
        <Button asChild className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
          <Link to="/">{t('goBackWorks')}</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-2 md:gap-4 px-0 md:px-8 py-3 md:py-8 max-w-3xl mx-auto w-full bg-[#f8f9fa] text-[#202124]">
      <nav className="flex justify-between items-center mb-2 md:mb-4 bg-white border-y md:border border-[#e8eaed] rounded-none md:rounded-xl p-3 shadow-sm shrink-0">
        <Button variant="ghost" onClick={handleBackClick} className="text-[#5f6368] hover:text-[#202124]">
          ← {t('works')}
        </Button>
        <Button
          variant={activeMode === 'editing' ? 'default' : 'outline'}
          className={activeMode === 'editing' ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white border-0' : 'text-[#5f6368]'}
          onClick={async () => {
            if (activeMode === 'editing') {
              await flushAutosave();
              refresh();
              await enterVisualization();
            } else {
              enterEditing(piece.id);
            }
          }}
        >
          {activeMode === 'editing' ? t('finishEditing') : t('editPiece')}
        </Button>
      </nav>

      <header className="mb-3 md:mb-6 border-b border-[#e8eaed] pb-2 md:pb-4 px-4 md:px-3">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-[#202124]">{piece.title}</h1>
        <div className="flex gap-2 text-xs md:text-sm text-[#80868b] mt-1 md:mt-2">
          <span>{t('type')}: {piece.type}</span>
          <span>•</span>
          <span>{t('updated')}: {new Date(piece.updatedAt).toLocaleDateString()}</span>
        </div>
      </header>

      <div className="flex-1 bg-white border-y md:border border-[#e8eaed] rounded-none md:rounded-xl p-4 md:p-6 min-h-[400px] shadow-none md:shadow-sm w-full">
        {activeMode === 'visualization' ? (
          <div className="visualization-view select-text">
            <div className="prose dark:prose-invert select-text">
              {renderBaseContent(piece.content)}
            </div>
          </div>
        ) : (
          <div className="editing-view">
             {piece.content.kind === 'song' ? (
               <p className="text-[#80868b]">Song editing is not supported in MVP.</p>
             ) : (
               <TiptapEditor
                 initialContent={piece.content}
                 onUpdate={handleUpdate}
               />
             )}
          </div>
        )}
      </div>

      {((isDesktop && selectionRect && selectedText) || (!isDesktop && showMobileToolbar)) && (
        <div
          className={
            isDesktop
              ? "visualization-selection-toolbar fixed z-50 flex items-center gap-0.5 p-1 bg-white/90 border border-[#dadce0] rounded-lg shadow-md backdrop-blur-md -translate-x-1/2 -translate-y-full select-none"
              : "visualization-selection-toolbar fixed left-4 right-4 z-50 flex items-center justify-around p-2 bg-white/95 border border-[#dadce0] rounded-xl shadow-lg backdrop-blur-md select-none animate-in fade-in slide-in-from-bottom-2 duration-200"
          }
          style={
            isDesktop
              ? {
                  top: `${Math.max(10, (selectionRect?.top ?? 0) - 12)}px`,
                  left: `${(selectionRect?.left ?? 0) + (selectionRect?.width ?? 0) / 2}px`,
                }
              : { bottom: '16px' }
          }
        >
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAnnotationClick('intent')}
            className="h-8 px-2 flex items-center gap-1.5 cursor-pointer text-[#5f6368] hover:text-[#202124] hover:bg-muted"
            title={t('intent')}
          >
            <Lightbulb className="h-3.5 w-3.5 text-[#e37400]" />
            {isDesktop && <span className="text-[11px] font-medium">{t('intent')}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAnnotationClick('comment')}
            className="h-8 px-2 flex items-center gap-1.5 cursor-pointer text-[#5f6368] hover:text-[#202124] hover:bg-muted"
            title={t('comment')}
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#1a73e8]" />
            {isDesktop && <span className="text-[11px] font-medium">{t('comment')}</span>}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleAnnotationClick('breath')}
            className="h-8 px-2 flex items-center gap-1.5 cursor-pointer text-[#5f6368] hover:text-[#202124] hover:bg-muted"
            title={t('breath')}
          >
            <Wind className="h-3.5 w-3.5 text-[#137333]" />
            {isDesktop && <span className="text-[11px] font-medium">{t('breath')}</span>}
          </Button>
          <div className="h-4 w-[1px] bg-[#dadce0] mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRefineClick}
            className="h-8 px-2.5 py-0 text-[11px] font-semibold tracking-tight text-[#1a73e8] hover:bg-[#e8f0fe] cursor-pointer"
          >
            {t('refine')}
          </Button>
        </div>
      )}

      <RefineSelectionModal
        isOpen={isRefineOpen}
        onClose={() => setIsRefineOpen(false)}
        text={refineText}
        selectionStart={refineStart}
        selectionEnd={refineEnd}
        onConfirm={handleRefineConfirm}
      />
    </main>
  );
}
