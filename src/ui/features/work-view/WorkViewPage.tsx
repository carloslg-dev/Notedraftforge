import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { useWorkView } from './use-work-view';
import { useUIStore } from '../../state/ui-store';
import { useTranslation } from '@/ui/hooks/use-translation';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Lightbulb, MessageSquare, Wind, Settings, Trash2, X } from 'lucide-react';
import { TiptapEditor } from '../../../core/infrastructure/editor/components/TiptapEditor';
import { PieceContent } from '../../../core/domain/types/';
import { AutosavePieceUseCase } from '../../../core/application/piece-management/autosave-piece.use-case';
import { DeleteAnnotationUseCase } from '../../../core/application/annotation-management/delete-annotation.use-case';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';
import { DexieAnnotationRepository } from '../../../core/infrastructure/adapters/dexie/annotation-repository';
import { toast } from 'sonner';
import { RefineSelectionModal } from './components/RefineSelectionModal';
import { useMediaQuery } from '@/ui/hooks/use-media-query';
import { AnnotationModal } from './components/AnnotationModal';
import type { AnnotationTarget, AnnotationKind, Annotation, TextRangeTarget, NoteAnnotationContent, BreathContent } from '../../../core/domain/types/';

function renderDecoratedContent(
  content: PieceContent,
  annotations: Annotation[],
  onSelectAnnotation: (annotation: Annotation) => void
) {
  if (content.kind === 'song') {
    return <p className="text-[#80868b]">Song visualization is not supported in MVP.</p>;
  }

  return (
    <div className="space-y-6 font-serif leading-relaxed text-[#202124] select-text">
      {content.blocks.map((block) => {
        const blockAnnotations = annotations.filter((a) => {
          if (a.target.kind === 'text-range') {
            return (a.target as TextRangeTarget).blockId === block.id;
          }
          return false;
        });

        const fullBlockText = block.runs.map((r) => r.text).join('');

        if (blockAnnotations.length === 0 || !fullBlockText) {
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
                <h2 key={block.id} data-block-id={block.id} className="text-xl font-bold tracking-tight text-[#202124] mt-6 mb-2">
                  {renderedRuns}
                </h2>
              );
            case 'quote':
              return (
                <blockquote key={block.id} data-block-id={block.id} className="border-l-4 border-[#dadce0] pl-4 italic text-[#5f6368] my-4">
                  {renderedRuns}
                </blockquote>
              );
            case 'line':
              return (
                <div key={block.id} data-block-id={block.id} className="min-h-[1.5rem] select-text">
                  {renderedRuns.length > 0 ? renderedRuns : <br />}
                </div>
              );
            case 'paragraph':
            default:
              return (
                <p key={block.id} data-block-id={block.id} className="min-h-[1.5rem] select-text">
                  {renderedRuns.length > 0 ? renderedRuns : <br />}
                </p>
              );
          }
        }

        // Sort all note annotations by startOffset ascending
        const allNoteAnns = blockAnnotations
          .filter(
            (a) => (a.kind === 'intent' || a.kind === 'comment') && (a.target as TextRangeTarget).startOffset < (a.target as TextRangeTarget).endOffset
          )
          .sort((a, b) => (a.target as TextRangeTarget).startOffset - (b.target as TextRangeTarget).startOffset);

        // Compute track line allocation for each note annotation
        const trackEndOffsets: number[] = [];
        const trackMap = new Map<string, number>();

        allNoteAnns.forEach((ann) => {
          const t = ann.target as TextRangeTarget;
          const s = Math.max(0, Math.min(fullBlockText.length, t.startOffset));
          const e = Math.max(s, Math.min(fullBlockText.length, t.endOffset));
          const noteTextLen = (ann.content as NoteAnnotationContent).shortNote.length;

          let assignedTrack = -1;
          for (let tr = 0; tr < trackEndOffsets.length; tr++) {
            if (trackEndOffsets[tr] <= s) {
              assignedTrack = tr;
              break;
            }
          }

          if (assignedTrack === -1) {
            assignedTrack = trackEndOffsets.length;
          }

          const occupiedEnd = Math.max(e + 2, s + Math.ceil(noteTextLen * 0.8) + 2);
          trackEndOffsets[assignedTrack] = occupiedEnd;
          trackMap.set(ann.id, assignedTrack);
        });

        // Collect all boundary offsets
        const boundarySet = new Set<number>();
        boundarySet.add(0);
        boundarySet.add(fullBlockText.length);

        blockAnnotations.forEach((ann) => {
          const target = ann.target as TextRangeTarget;
          const s = Math.max(0, Math.min(fullBlockText.length, target.startOffset));
          const e = Math.max(s, Math.min(fullBlockText.length, target.endOffset));
          boundarySet.add(s);
          boundarySet.add(e);
        });

        const boundaries = Array.from(boundarySet).sort((a, b) => a - b);
        const elements: React.ReactNode[] = [];

        for (let i = 0; i < boundaries.length; i++) {
          const pos = boundaries[i];

          // 1. Render point annotations (start === end === pos)
          const pointAnns = blockAnnotations.filter((a) => {
            const t = a.target as TextRangeTarget;
            return t.startOffset === pos && t.endOffset === pos;
          });

          pointAnns.forEach((ann) => {
            if (ann.kind === 'breath') {
              const breathContent = ann.content as BreathContent;
              elements.push(
                <span
                  key={`point-${ann.id}`}
                  data-annotation-ignore="true"
                  className="ndf-annotation ndf-layer-breath inline-flex items-center justify-center px-1.5 py-0.5 mx-0.5 text-[11px] font-extrabold rounded bg-[#e6f4ea] text-[#137333] border border-[#ceebd6] shadow-2xs select-none cursor-pointer hover:bg-[#ceebd6] transition-colors"
                  title="Respiración"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAnnotation(ann);
                  }}
                >
                  {breathContent.mark}
                </span>
              );
            }
          });

          // 2. Render range interval [pos, nextPos]
          if (i < boundaries.length - 1) {
            const nextPos = boundaries[i + 1];
            if (nextPos > pos) {
              const segmentText = fullBlockText.slice(pos, nextPos);

              const coveringAnns = blockAnnotations.filter((a) => {
                const t = a.target as TextRangeTarget;
                return t.startOffset <= pos && t.endOffset >= nextPos && t.startOffset < t.endOffset;
              });

              if (coveringAnns.length === 0) {
                elements.push(
                  <span key={`plain-${pos}-${nextPos}`}>
                    {segmentText}
                  </span>
                );
              } else {
                const breathAnns = coveringAnns.filter((a) => a.kind === 'breath');
                const noteAnns = coveringAnns.filter((a) => a.kind === 'intent' || a.kind === 'comment');

                const isIntentCovered = noteAnns.some((a) => a.kind === 'intent');
                const isCommentCovered = noteAnns.some((a) => a.kind === 'comment');

                let bgClasses = '';
                if (isIntentCovered && isCommentCovered) {
                  bgClasses = 'bg-[#fef7e0]/80 border-b-2 border-[#e37400]';
                } else if (isIntentCovered) {
                  bgClasses = 'bg-[#fef7e0]/60 border-b-2 border-[#f9ab00]';
                } else if (isCommentCovered) {
                  bgClasses = 'bg-[#e8f0fe]/60 border-b-2 border-[#1a73e8]';
                } else if (breathAnns.length > 0) {
                  bgClasses = 'bg-[#e6f4ea]/60 border-b border-[#188038]';
                }

                elements.push(
                  <span
                    key={`ann-span-${pos}-${nextPos}`}
                    className={`ndf-annotation relative inline-block my-2 pt-4 px-0.5 rounded transition-all ${bgClasses}`}
                  >
                    {/* Floating handwritten notes rendered whole at startOffset */}
                    {noteAnns
                      .filter((ann) => (ann.target as TextRangeTarget).startOffset === pos)
                      .map((ann) => {
                        const noteContent = ann.content as NoteAnnotationContent;
                        const isIntent = ann.kind === 'intent';
                        const trackIdx = trackMap.get(ann.id) ?? 0;
                        const topPx = -16 - trackIdx * 22;

                        return (
                          <span
                            key={`floating-${ann.id}`}
                            data-annotation-ignore="true"
                            className="absolute left-0 text-base font-handwriting font-bold whitespace-nowrap pointer-events-auto leading-none bg-white/95 px-1.5 py-0.5 rounded shadow-xs border border-[#dadce0]/70 select-none cursor-pointer hover:scale-105 transition-transform"
                            style={{
                              top: `${topPx}px`,
                              color: isIntent ? '#e37400' : '#1a73e8',
                              zIndex: 10 + trackIdx
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectAnnotation(ann);
                            }}
                          >
                            {noteContent.shortNote}
                          </span>
                        );
                      })}

                    <span>{segmentText}</span>

                    {/* Range breath badges */}
                    {breathAnns.map((ann) => {
                      const breathContent = ann.content as BreathContent;
                      return (
                        <span
                          key={`breath-range-${ann.id}`}
                          data-annotation-ignore="true"
                          className="ndf-annotation ndf-layer-breath inline-flex items-center justify-center px-1.5 py-0.5 ml-1 text-[11px] font-extrabold rounded bg-[#e6f4ea] text-[#137333] border border-[#ceebd6] shadow-2xs select-none cursor-pointer hover:bg-[#ceebd6]"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAnnotation(ann);
                          }}
                        >
                          {breathContent.mark}
                        </span>
                      );
                    })}
                  </span>
                );
              }
            }
          }
        }

        switch (block.kind) {
          case 'heading':
            return (
              <h2 key={block.id} data-block-id={block.id} className="text-xl font-bold tracking-tight text-[#202124] mt-6 mb-2">
                {elements}
              </h2>
            );
          case 'quote':
            return (
              <blockquote key={block.id} data-block-id={block.id} className="border-l-4 border-[#dadce0] pl-4 italic text-[#5f6368] my-4">
                {elements}
              </blockquote>
            );
          case 'line':
            return (
              <div key={block.id} data-block-id={block.id} className="min-h-[1.5rem] select-text">
                {elements}
              </div>
            );
          case 'paragraph':
          default:
            return (
              <p key={block.id} data-block-id={block.id} className="min-h-[1.5rem] select-text">
                {elements}
              </p>
            );
        }
      })}
    </div>
  );
}

function isIgnoredNode(node: Node, root: HTMLElement): boolean {
  let curr: Node | null = node;
  while (curr && curr !== root) {
    if (curr.nodeType === Node.ELEMENT_NODE && (curr as HTMLElement).hasAttribute('data-annotation-ignore')) {
      return true;
    }
    curr = curr.parentNode;
  }
  return false;
}

function getRangeOffsetsRelativeToElement(element: HTMLElement, range: Range) {
  let startOffset = 0;
  let endOffset = 0;
  let currentLength = 0;
  let foundStart = false;
  let foundEnd = false;

  function walk(node: Node) {
    if (foundStart && foundEnd) return;

    if (node.nodeType === Node.TEXT_NODE) {
      if (isIgnoredNode(node, element)) return;

      const len = node.textContent?.length || 0;

      if (!foundStart) {
        if (node === range.startContainer) {
          startOffset = currentLength + range.startOffset;
          foundStart = true;
        }
      }

      if (!foundEnd) {
        if (node === range.endContainer) {
          endOffset = currentLength + range.endOffset;
          foundEnd = true;
        }
      }

      currentLength += len;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        walk(node.childNodes[i]);
      }
    }
  }

  walk(element);

  if (!foundStart || !foundEnd) {
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    startOffset = preSelectionRange.toString().length;
    endOffset = startOffset + range.toString().length;
  }

  return { start: startOffset, end: endOffset };
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
      if (isIgnoredNode(node, element)) return;

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
  const { piece, annotations, loading, error, refresh } = useWorkView(pieceId);
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
  const [isProcessingMode, setIsProcessingMode] = useState(false);
  const [isAnnotationModalOpen, setIsAnnotationModalOpen] = useState(false);
  const [annotationModalKind, setAnnotationModalKind] = useState<AnnotationKind>('intent');
  const [annotationTarget, setAnnotationTarget] = useState<AnnotationTarget | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  const handleDeleteAnnotation = async () => {
    if (!selectedAnnotation || !piece) return;
    try {
      const pieceRepo = new DexiePieceRepository();
      const annotationRepo = new DexieAnnotationRepository();
      const useCase = new DeleteAnnotationUseCase(pieceRepo, annotationRepo);
      await useCase.execute(selectedAnnotation.id, piece.id);
      toast.success('Anotación eliminada');
      setSelectedAnnotation(null);
      refresh();
    } catch (err) {
      console.error('Failed to delete annotation:', err);
      toast.error('Error al eliminar la anotación');
    }
  };

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
      setSelectedText(selection.toString());
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

  const handleAnnotationClick = (kind: AnnotationKind) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const blockElem =
      range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
        ? (range.commonAncestorContainer as HTMLElement).closest('[data-block-id]')
        : range.commonAncestorContainer.parentElement?.closest('[data-block-id]');

    if (blockElem) {
      const blockId = blockElem.getAttribute('data-block-id')!;
      const { start, end } = getRangeOffsetsRelativeToElement(blockElem as HTMLElement, range);
      setAnnotationTarget({
        kind: 'text-range',
        blockId,
        startOffset: start,
        endOffset: end
      });
      setAnnotationModalKind(kind);
      setIsAnnotationModalOpen(true);
    }
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
        <div className="flex items-center gap-2">
          <Button
            variant={activeMode === 'editing' ? 'default' : 'outline'}
            disabled={isProcessingMode}
            className={activeMode === 'editing' ? 'bg-[#1a73e8] hover:bg-[#1557b0] text-white border-0' : 'text-[#5f6368]'}
            onClick={async () => {
              if (isProcessingMode) return;
              try {
                setIsProcessingMode(true);
                if (activeMode === 'editing') {
                  await flushAutosave();
                  refresh();
                  await enterVisualization();
                } else {
                  enterEditing(piece.id);
                }
              } finally {
                setIsProcessingMode(false);
              }
            }}
          >
            {activeMode === 'editing' ? t('finishEditing') : t('editPiece')}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => toast.info(t('settings'))} title={t('settings')}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
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
              {renderDecoratedContent(piece.content, annotations, (ann) => setSelectedAnnotation(ann))}
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

      <AnnotationModal
        isOpen={isAnnotationModalOpen}
        onClose={() => setIsAnnotationModalOpen(false)}
        pieceId={piece.id}
        kind={annotationModalKind}
        target={annotationTarget}
        onSuccess={() => refresh()}
      />

      {selectedAnnotation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAnnotation(null)}
        >
          <div
            className="w-full max-w-sm bg-card text-card-foreground border rounded-xl shadow-lg p-5 flex flex-col gap-4 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedAnnotation.kind === 'breath' && <Wind className="h-4 w-4 text-[#188038]" />}
                {selectedAnnotation.kind === 'intent' && <Lightbulb className="h-4 w-4 text-[#e37400]" />}
                {selectedAnnotation.kind === 'comment' && <MessageSquare className="h-4 w-4 text-[#1a73e8]" />}
                <span className="font-bold text-sm uppercase tracking-wide text-[#202124]">
                  {selectedAnnotation.kind === 'breath' ? 'Respiración' : selectedAnnotation.kind === 'intent' ? 'Intención' : 'Comentario'}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#5f6368]" onClick={() => setSelectedAnnotation(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {selectedAnnotation.kind === 'breath' ? (
              <div className="p-3 bg-[#e6f4ea] text-[#137333] rounded-lg font-bold text-center">
                Pausa {(selectedAnnotation.content as BreathContent).mark === 'S' ? 'Corta (S)' : 'Larga (L)'}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <span className="text-lg font-handwriting font-bold text-[#e37400]">
                  {(selectedAnnotation.content as NoteAnnotationContent).shortNote}
                </span>
                {(selectedAnnotation.content as NoteAnnotationContent).extendedNote && (
                  <p className="text-xs text-[#5f6368] bg-muted p-2.5 rounded-md leading-relaxed">
                    {(selectedAnnotation.content as NoteAnnotationContent).extendedNote}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteAnnotation}
                className="flex items-center gap-1 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar Anotación
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
