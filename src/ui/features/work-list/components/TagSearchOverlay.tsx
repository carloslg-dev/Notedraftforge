import { useState, useMemo } from 'react';
import { Badge } from '@/ui/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/components/ui/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/ui/components/ui/sheet';
import { Input } from '@/ui/components/ui/input';
import { useTranslation } from '@/ui/hooks/use-translation';

interface TagSearchOverlayProps {
  availableTags: string[];
  activeTags: string[];
  onSelectTag: (tag: string) => void;
  isDesktop: boolean;
}

export function TagSearchOverlay({
  availableTags,
  activeTags,
  onSelectTag,
  isDesktop
}: Readonly<TagSearchOverlayProps>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Active overflow tag name shows inside '···' chip when an overflow tag is selected
  // We take the first active tag that is in the availableTags (which are the overflow tags passed in)
  const activeOverflowTag = useMemo(() => {
    return activeTags.find(tag => availableTags.includes(tag));
  }, [activeTags, availableTags]);

  const triggerLabel = activeOverflowTag ?? '···';
  const triggerVariant = activeOverflowTag ? 'default' : 'outline';

  const filteredTags = useMemo(() => {
    if (!query) return availableTags;
    const lowerQuery = query.toLowerCase();
    return availableTags.filter(tag => tag.toLowerCase().includes(lowerQuery));
  }, [availableTags, query]);

  const handleSelect = (tag: string) => {
    onSelectTag(tag);
    setOpen(false);
    setQuery('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery('');
    }
  };

  const TriggerButton = (
    <Badge
      variant={triggerVariant}
      className="cursor-pointer hover:bg-primary/80"
    >
      {triggerLabel}
    </Badge>
  );

  const Content = (
    <div className="flex flex-col gap-4 py-4 md:py-0 w-full h-full" aria-label="Tag Search Overlay">
      <Input
        placeholder={t('searchPlaceholder')}
        value={query}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        className="w-full"
        autoFocus
      />

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px]">
        {filteredTags.length === 0 ? (
          <p className="text-sm text-[#80868b] text-center py-4">
            {t('noTagsMatching')} "{query}"
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(tag => {
              const isActive = activeTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isActive ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80"
                  onClick={() => handleSelect(tag)}
                >
                  {tag}
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          {TriggerButton}
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          {Content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {TriggerButton}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[50vh] rounded-t-xl px-4 pb-8">
        {Content}
      </SheetContent>
    </Sheet>
  );
}
