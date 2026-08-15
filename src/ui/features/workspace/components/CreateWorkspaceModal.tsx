import React, { useState } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useTranslation } from '@/ui/hooks/use-translation';
import { CreatePerformanceFlowUseCase } from '@/core/application/performance-flow/create-performance-flow.use-case';
import { DexiePerformanceFlowRepository } from '@/core/infrastructure/adapters/dexie/performance-flow-repository';

interface CreateWorkspaceModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSuccess: (workspaceId: string) => void;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSuccess
}: Readonly<CreateWorkspaceModalProps>) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !title.trim()) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const repository = new DexiePerformanceFlowRepository();
      const useCase = new CreatePerformanceFlowUseCase(repository);

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const trimmedDesc = description.trim();
      const flow = await useCase.execute({
        title: title.trim(),
        description: trimmedDesc.length > 0 ? trimmedDesc : undefined,
        tags
      });

      onSuccess(flow.id);
      setTitle('');
      setDescription('');
      setTagsInput('');
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error creating workspace');
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
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {t('createWorkspaceTitle')}
          </h2>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md border border-destructive/20">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-workspace-title-input" className="text-xs font-semibold text-muted-foreground uppercase">
              {t('titleLabel')}
            </label>
            <input
              id="create-workspace-title-input"
              type="text"
              required
              placeholder={t('workspaceTitlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-workspace-desc-input" className="text-xs font-semibold text-muted-foreground uppercase">
              Descripción (Opcional)
            </label>
            <textarea
              id="create-workspace-desc-input"
              rows={2}
              placeholder="Notas sobre el recital o colección..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-workspace-tags-input" className="text-xs font-semibold text-muted-foreground uppercase">
              Etiquetas (separadas por comas)
            </label>
            <input
              id="create-workspace-tags-input"
              type="text"
              placeholder="recital, 2026, antologia"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

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
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? t('saving') : t('createButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
