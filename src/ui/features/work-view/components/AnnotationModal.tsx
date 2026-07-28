import { useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useTranslation } from '@/ui/hooks/use-translation';
import type { AnnotationKind, AnnotationTarget } from '../../../../core/domain/types/index';
import { CreateAnnotationUseCase } from '../../../../core/application/annotation-management/create-annotation.use-case';
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
  onSuccess: () => void;
}

export function AnnotationModal({
  isOpen,
  onClose,
  pieceId,
  kind,
  target,
  onSuccess
}: AnnotationModalProps) {
  const { t } = useTranslation();
  const [mark, setMark] = useState<'S' | 'L'>('S');
  const [position, setPosition] = useState<'before' | 'after'>('after');
  const [shortNote, setShortNote] = useState('');
  const [extendedNote, setExtendedNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !target) return null;

  const getTitleAndIcon = () => {
    switch (kind) {
      case 'breath':
        return { title: t('addBreath'), icon: <Wind className="h-5 w-5 text-[#188038]" /> };
      case 'intent':
        return { title: t('addIntent'), icon: <Lightbulb className="h-5 w-5 text-[#e37400]" /> };
      case 'comment':
        return { title: t('addComment'), icon: <MessageSquare className="h-5 w-5 text-[#1a73e8]" /> };
    }
  };

  const { title, icon } = getTitleAndIcon();

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
      const useCase = new CreateAnnotationUseCase(pieceRepo, annotationRepo);

      let finalTarget = target;
      if (kind === 'breath' && target.kind === 'text-range') {
        const textRange = target;
        if (position === 'before') {
          finalTarget = {
            ...textRange,
            endOffset: textRange.startOffset
          };
        } else if (position === 'after') {
          finalTarget = {
            ...textRange,
            startOffset: textRange.endOffset
          };
        }
      }

      const content =
        kind === 'breath'
          ? { mark }
          : {
              shortNote: shortNote.trim(),
              ...(extendedNote.trim() ? { extendedNote: extendedNote.trim() } : {})
            };

      await useCase.execute({
        pieceId,
        kind,
        target: finalTarget,
        content
      });

      toast.success(t('annotationCreated'));
      setShortNote('');
      setExtendedNote('');
      setMark('S');
      setPosition('after');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Failed to create annotation:', err);
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-card text-card-foreground border rounded-xl shadow-lg p-6 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold tracking-tight text-[#202124]">
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {kind === 'breath' ? (
            /* Breath Mark Selector & Placement */
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5f6368] uppercase">
                  {t('breathTypeLabel')}
                </label>
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
                <label className="text-xs font-semibold text-[#5f6368] uppercase">
                  Ubicación de la pausa
                </label>
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
                <label className="text-xs font-semibold text-[#5f6368] uppercase">
                  {t('shortNoteLabel')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={kind === 'intent' ? t('intentPlaceholder') : t('commentPlaceholder')}
                  value={shortNote}
                  onChange={(e) => setShortNote(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#5f6368] uppercase">
                  {t('extendedNoteLabel')}
                </label>
                <textarea
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
