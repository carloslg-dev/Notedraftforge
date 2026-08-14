import { useState, useEffect } from 'react';
import { Button } from '@/ui/components/ui/button';
import { useTranslation } from '@/ui/hooks/use-translation';

interface RefineSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
  selectionStart: number;
  selectionEnd: number;
  onConfirm: (newStart: number, newEnd: number) => void;
}

function getBoundaryContext(text: string, index: number): { before: string; char: string; after: string } {
  // Extract up to 8 characters before the index
  const startBefore = Math.max(0, index - 8);
  const before = text.slice(startBefore, index);

  // The character at the boundary index itself
  const char = text.charAt(index) || ' ';

  // Extract up to 8 characters after the index (excluding the current char)
  const after = text.slice(index + 1, Math.min(text.length, index + 9));

  return { before, char, after };
}

export function RefineSelectionModal({
  isOpen,
  onClose,
  text,
  selectionStart,
  selectionEnd,
  onConfirm
}: Readonly<RefineSelectionModalProps>) {
  const { t } = useTranslation();
  const [start, setStart] = useState(selectionStart);
  const [end, setEnd] = useState(selectionEnd);

  // Keep state in sync with props when opening/changing selections
  useEffect(() => {
    setStart(selectionStart);
    setEnd(selectionEnd);
  }, [selectionStart, selectionEnd, isOpen]);

  if (!isOpen) return null;

  const handleNudgeStart = (delta: number) => {
    const newStart = Math.max(0, Math.min(end - 1, start + delta));
    setStart(newStart);
  };

  const handleNudgeEnd = (delta: number) => {
    const newEnd = Math.max(start + 1, Math.min(text.length, end + delta));
    setEnd(newEnd);
  };

  const handleConfirm = () => {
    onConfirm(start, end);
    onClose();
  };

  const startContext = getBoundaryContext(text, start);
  const endContext = getBoundaryContext(text, end);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10 animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="w-full max-w-md bg-card text-card-foreground border rounded-xl shadow-lg p-6 flex flex-col gap-5 relative animate-in zoom-in-95 duration-200">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-[#202124]">
            {t('refineSelection')}
          </h2>
        </div>

        {/* Start boundary control */}
        <div className="flex flex-col gap-2 p-3 bg-muted/40 border rounded-lg">
          <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">
            {t('startBoundary')}
          </span>
          <div className="flex items-center justify-between gap-4 mt-1">
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-8 w-8 cursor-pointer active:scale-95"
              onClick={() => handleNudgeStart(-1)}
              disabled={start <= 0}
            >
              ←
            </Button>
            <div className="flex-1 text-center font-mono text-xs tracking-wide select-none overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="text-[#80868b]">{startContext.before}</span>
              <span className="bg-[#e8f0fe] text-[#1a73e8] font-bold px-1.5 py-0.5 rounded border border-[#d2e3fc] mx-0.5">
                {startContext.char}
              </span>
              <span className="text-[#80868b]">{startContext.after}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-8 w-8 cursor-pointer active:scale-95"
              onClick={() => handleNudgeStart(1)}
              disabled={start >= end - 1}
            >
              →
            </Button>
          </div>
        </div>

        {/* End boundary control */}
        <div className="flex flex-col gap-2 p-3 bg-muted/40 border rounded-lg">
          <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">
            {t('endBoundary')}
          </span>
          <div className="flex items-center justify-between gap-4 mt-1">
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-8 w-8 cursor-pointer active:scale-95"
              onClick={() => handleNudgeEnd(-1)}
              disabled={end <= start + 1}
            >
              ←
            </Button>
            <div className="flex-1 text-center font-mono text-xs tracking-wide select-none overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="text-[#80868b]">{endContext.before}</span>
              <span className="bg-[#e8f0fe] text-[#1a73e8] font-bold px-1.5 py-0.5 rounded border border-[#d2e3fc] mx-0.5">
                {endContext.char}
              </span>
              <span className="text-[#80868b]">{endContext.after}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              type="button"
              className="h-8 w-8 cursor-pointer active:scale-95"
              onClick={() => handleNudgeEnd(1)}
              disabled={end >= text.length}
            >
              →
            </Button>
          </div>
        </div>

        {/* Text preview */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider">
            {t('previewLabel')}
          </span>
          <div className="p-3 bg-muted/30 border rounded-lg text-sm italic text-[#202124] min-h-[2.5rem] select-text break-all">
            {text.slice(start, end)}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 mt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            className="bg-[#1a73e8] hover:bg-[#1557b0] text-white cursor-pointer"
            onClick={handleConfirm}
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
