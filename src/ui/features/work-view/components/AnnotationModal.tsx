import { useState, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useTranslation } from '@/ui/hooks/use-translation';
import type { AnnotationKind, AnnotationTarget, Annotation, BreathContent, NoteAnnotationContent } from '../../../../core/domain/types/index';
import { CreateAnnotationUseCase } from '../../../../core/application/annotation-management/create-annotation.use-case';
import { UpdateAnnotationUseCase } from '../../../../core/application/annotation-management/update-annotation.use-case';
import { DexiePieceRepository } from '../../../../core/infrastructure/adapters/dexie/piece-repository';
import { DexieAnnotationRepository } from '../../../../core/infrastructure/adapters/dexie/annotation-repository';
import { Lightbulb, MessageSquare, Wind } from 'lucide-react';
import { toast } from 'sonner';

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pieceId: string;
  kind: AnnotationKind;
  target: AnnotationTarget | null;
  annotationToEdit?: Annotation | null;
  onSuccess: () => void;
}

function computeFinalTarget(
  target: AnnotationTarget | null,
  kind: AnnotationKind,
  position: 'before' | 'after'
): AnnotationTarget | null {
  if (kind === 'breath' && target?.kind === 'text-range') {
    const textRange = target;
    if (position === 'before') {
      return {
        ...textRange,
        endOffset: textRange.startOffset
      };
    }
    if (position === 'after') {
      return {
        ...textRange,
        startOffset: textRange.endOffset
      };
    }
  }
  return target;
}

async function executeSaveAnnotation(
  pieceRepo: DexiePieceRepository,
  annotationRepo: DexieAnnotationRepository,
  params: {
    pieceId: string;
    kind: AnnotationKind;
    finalTarget: AnnotationTarget | null;
    content: BreathContent | NoteAnnotationContent;
    annotationToEdit?: Annotation | null;
  }
) {
  const { pieceId, kind, finalTarget, content, annotationToEdit } = params;
  if (annotationToEdit) {
    const updateUseCase = new UpdateAnnotationUseCase(pieceRepo, annotationRepo);
    await updateUseCase.execute({
      annotationId: annotationToEdit.id,
      pieceId,
      content,
      ...(finalTarget ? { target: finalTarget } : {})
    });
  } else {
    const createUseCase = new CreateAnnotationUseCase(pieceRepo, annotationRepo);
    await createUseCase.execute({
      pieceId,
      kind,
      target: finalTarget!,
      content
    });
  }
}

function getModalHeader(
  kind: AnnotationKind,
  isEdit: boolean,
  t: (key: string) => string
): { title: string; icon: React.ReactNode } {
  if (kind === 'breath') {
    return {
      title: isEdit ? 'Editar Respiración' : t('addBreath'),
      icon: <Wind className="h-5 w-5 text-[#188038]" />
    };
  }
  if (kind === 'intent') {
    return {
      title: isEdit ? 'Editar Intención' : t('addIntent'),
      icon: <Lightbulb className="h-5 w-5 text-[#e37400]" />
    };
  }
  return {
    title: isEdit ? 'Editar Comentario' : t('addComment'),
    icon: <MessageSquare className="h-5 w-5 text-[#1a73e8]" />
  };
}

function useAnnotationFormState(annotationToEdit?: Annotation | null, isOpen?: boolean) {
  const [mark, setMark] = useState<'S' | 'L'>('S');
  const [position, setPosition] = useState<'before' | 'after'>('after');
  const [shortNote, setShortNote] = useState('');
  const [extendedNote, setExtendedNote] = useState('');

  useEffect(() => {
    if (annotationToEdit) {
      if (annotationToEdit.kind === 'breath') {
        const breathContent = annotationToEdit.content as BreathContent;
        setMark(breathContent.mark || 'S');
      } else {
        const noteContent = annotationToEdit.content as NoteAnnotationContent;
        setShortNote(noteContent.shortNote || '');
        setExtendedNote(noteContent.extendedNote || '');
      }
    } else {
      setShortNote('');
      setExtendedNote('');
      setMark('S');
      setPosition('after');
    }
  }, [annotationToEdit, isOpen]);

  const reset = () => {
    setShortNote('');
    setExtendedNote('');
    setMark('S');
    setPosition('after');
  };

  return {
    mark,
    setMark,
    position,
    setPosition,
    shortNote,
    setShortNote,
    extendedNote,
    setExtendedNote,
    reset
  };
}

export function AnnotationModal({
  isOpen,
  onClose,
  pieceId,
  kind,
  target,
  annotationToEdit,
  onSuccess
}: Readonly<AnnotationModalProps>) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    mark,
    setMark,
    position,
    setPosition,
    shortNote,
    setShortNote,
    extendedNote,
    setExtendedNote,
    reset
  } = useAnnotationFormState(annotationToEdit, isOpen);

  if (!isOpen || (!target && !annotationToEdit)) return null;

  const isEdit = Boolean(annotationToEdit);
  const { title: modalTitle, icon: modalIcon } = getModalHeader(kind, isEdit, t as (k: string) => string);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (kind !== 'breath' && !shortNote.trim()) {
      toast.error(t('shortNoteRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      const pieceRepo = new DexiePieceRepository();
      const annotationRepo = new DexieAnnotationRepository();

      const finalTarget = computeFinalTarget(target, kind, position);
      const content =
        kind === 'breath'
          ? { mark }
          : {
              shortNote: shortNote.trim(),
              ...(extendedNote.trim() ? { extendedNote: extendedNote.trim() } : {})
            };

      await executeSaveAnnotation(pieceRepo, annotationRepo, {
        pieceId,
        kind,
        finalTarget,
        content,
        annotationToEdit
      });

      toast.success(annotationToEdit ? 'Anotación actualizada' : t('annotationCreated'));
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to save annotation:', err);
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-card text-card-foreground border rounded-xl shadow-lg p-6 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-2">
          {modalIcon}
          <h2 className="text-lg font-semibold tracking-tight text-[#202124]">
            {modalTitle}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {kind === 'breath' ? (
            /* Breath Mark Selector & Placement */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#5f6368] uppercase">
                  {t('breathTypeLabel')}
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setMark('S')}
                    className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      mark === 'S'
                        ? 'border-[#188038] bg-[#e6f4ea] text-[#137333]'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <span className="font-bold text-base">S</span>
                    <span className="text-xs">{t('shortPause')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMark('L')}
                    className={`flex-1 p-3 rounded-lg border flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                      mark === 'L'
                        ? 'border-[#188038] bg-[#e6f4ea] text-[#137333]'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    <span className="font-bold text-base">L</span>
                    <span className="text-xs">{t('longPause')}</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-[#5f6368] uppercase">
                  Ubicación de la pausa
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPosition('before')}
                    className={`flex-1 h-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                      position === 'before'
                        ? 'border-[#188038] bg-[#e6f4ea] text-[#137333]'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    Antes de la selección
                  </button>
                  <button
                    type="button"
                    onClick={() => setPosition('after')}
                    className={`flex-1 h-9 rounded-md border text-xs font-semibold transition-colors cursor-pointer ${
                      position === 'after'
                        ? 'border-[#188038] bg-[#e6f4ea] text-[#137333]'
                        : 'border-input hover:bg-accent'
                    }`}
                  >
                    Después de la selección
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Note Annotation Fields */
            <>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="short-note-input" className="text-xs font-semibold text-[#5f6368] uppercase">
                  {t('shortNoteLabel')} *
                </label>
                <input
                  id="short-note-input"
                  type="text"
                  required
                  placeholder={kind === 'intent' ? t('intentPlaceholder') : t('commentPlaceholder')}
                  value={shortNote}
                  onChange={(e) => setShortNote(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="extended-note-input" className="text-xs font-semibold text-[#5f6368] uppercase">
                  {t('extendedNoteLabel')}
                </label>
                <textarea
                  id="extended-note-input"
                  rows={3}
                  placeholder={t('extendedNotePlaceholder')}
                  value={extendedNote}
                  onChange={(e) => setExtendedNote(e.target.value)}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans resize-none"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (kind !== 'breath' && !shortNote.trim())}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium"
            >
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

