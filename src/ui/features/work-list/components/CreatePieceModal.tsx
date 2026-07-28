import { useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useTranslation } from '@/ui/hooks/use-translation';
import { CreatePieceUseCase } from '../../../../core/application/piece-management/create-piece.use-case';
import { DexiePieceRepository } from '../../../../core/infrastructure/adapters/dexie/piece-repository';

interface CreatePieceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pieceId: string) => void;
}

export function CreatePieceModal({
  isOpen,
  onClose,
  onSuccess
}: CreatePieceModalProps) {
  const { t, uiLanguage } = useTranslation();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'text' | 'poem'>('text');
  const [language, setLanguage] = useState<string>(uiLanguage);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;

    try {
      setIsSubmitting(true);
      const repository = new DexiePieceRepository();
      const useCase = new CreatePieceUseCase(repository);

      const piece = await useCase.execute({
        title: title.trim(),
        type,
        language: language.trim() || uiLanguage
      });

      onSuccess(piece.id);
      setTitle('');
      setType('text');
      onClose();
    } catch (err) {
      console.error('Failed to create piece:', err);
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
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-[#202124]">
            {t('createPieceTitle')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#5f6368] uppercase">
              {t('titleLabel')}
            </label>
            <input
              type="text"
              required
              placeholder={t('pieceTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Type Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#5f6368] uppercase">
              {t('typeLabel')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex-1 h-10 rounded-md border text-sm font-semibold transition-colors cursor-pointer ${
                  type === 'text'
                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1967d2]'
                    : 'border-input hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t('textOption')}
              </button>
              <button
                type="button"
                onClick={() => setType('poem')}
                className={`flex-1 h-10 rounded-md border text-sm font-semibold transition-colors cursor-pointer ${
                  type === 'poem'
                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#1967d2]'
                    : 'border-input hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {t('poemOption')}
              </button>
            </div>
          </div>

          {/* Language Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#5f6368] uppercase">
              {t('languageLabel')}
            </label>
            <input
              type="text"
              required
              maxLength={2}
              value={language}
              onChange={(e) => setLanguage(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
              className="flex h-10 w-20 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-center font-bold"
            />
          </div>

          {/* Footer Actions */}
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
              disabled={isSubmitting || !title.trim()}
              className="bg-[#1a73e8] hover:bg-[#1557b0] text-white"
            >
              {isSubmitting ? t('generating') : t('createButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
