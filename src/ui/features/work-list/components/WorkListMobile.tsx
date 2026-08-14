import { Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { TagSearchOverlay } from './TagSearchOverlay';
import {
  Plus,
  Download,
  Upload,
  ChevronRight,
  Feather,
  FileText,
  Settings,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import type { Piece } from '@/core/domain/types/';
import type { TranslationKey } from '@/ui/hooks/use-translation';

interface WorkListMobileProps {
  visiblePieces: Piece[];
  filteredPieces: Piece[];
  availableUserTags: string[];
  activeTypeFilters: string[];
  activeUserFilters: string[];
  toggleTypeFilter: (type: string) => void;
  toggleUserFilter: (tag: string) => void;
  clearFilters: () => void;
  isExporting: boolean;
  exportBackup: () => void;
  setIsRestoreModalOpen: (open: boolean) => void;
  handleNewWorkClick: () => void;
  handleOpenWorkspaces?: () => void;
  isDesktop: boolean;
  t: (key: TranslationKey) => string;
  uiLanguage: 'es' | 'en';
  setUILanguage: (lang: 'es' | 'en') => void;
}

export function WorkListMobile({
  visiblePieces,
  filteredPieces,
  availableUserTags,
  activeTypeFilters,
  activeUserFilters,
  toggleTypeFilter,
  toggleUserFilter,
  clearFilters,
  isExporting,
  exportBackup,
  setIsRestoreModalOpen,
  handleNewWorkClick,
  handleOpenWorkspaces,
  isDesktop,
  t,
  uiLanguage,
  setUILanguage
}: Readonly<WorkListMobileProps>) {
  const visibleLimit = 2;
  const visibleTags = availableUserTags.slice(0, visibleLimit);
  const overflowTags = availableUserTags.slice(visibleLimit);

  const MVP_VISIBLE_TYPES = ['text', 'poem'];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] text-[#202124] relative pb-20 select-none">
      {/* Mobile Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-white border-b border-[#e8eaed] shrink-0 shadow-sm">
        <span className="font-sans text-xl font-bold text-[#202124] tracking-tight">{t('works')}</span>
        <div className="flex items-center gap-1">
          {/* Active Language toggle for mobile */}
          <div className="inline-flex rounded-lg border border-[#dadce0] overflow-hidden mr-1">
            <button
              type="button"
              onClick={() => setUILanguage('es')}
              className={`h-[26px] px-2 text-[10px] font-bold border-0 cursor-pointer ${
                uiLanguage === 'es' ? 'bg-[#202124] text-white' : 'bg-transparent text-[#5f6368]'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setUILanguage('en')}
              className={`h-[26px] px-2 text-[10px] font-bold border-0 cursor-pointer ${
                uiLanguage === 'en' ? 'bg-[#202124] text-white' : 'bg-transparent text-[#5f6368]'
              }`}
            >
              EN
            </button>
          </div>
          {handleOpenWorkspaces && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={handleOpenWorkspaces} title={t('workspaces')}>
              <Layers className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => setIsRestoreModalOpen(true)} title={t('restoreBackup')}>
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={exportBackup} disabled={isExporting} title={t('exportBackup')}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => toast.info(t('settings'))} title={t('settings')}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Filter chips */}
      {visiblePieces.length > 0 && (
        <div className="px-4 py-2.5 flex gap-1.5 overflow-x-auto bg-white border-b border-[#e8eaed] shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={clearFilters}
            className={`px-3 py-0.5 rounded-full border text-[11px] font-medium shrink-0 cursor-pointer ${
              activeTypeFilters.length === 0 && activeUserFilters.length === 0
                ? 'bg-[#202124] text-white border-[#202124]'
                : 'bg-transparent text-[#5f6368] border-[#dadce0]'
            }`}
          >
            {t('allFilter')}
          </button>
          {MVP_VISIBLE_TYPES.map(type => {
            const isActive = activeTypeFilters.includes(type);
            const activeColorClass = type === 'poem'
              ? 'bg-[oklch(0.88_0.06_330)] text-[oklch(0.42_0.13_335)] border-[oklch(0.88_0.06_330)]'
              : 'bg-[oklch(0.88_0.06_150)] text-[oklch(0.38_0.1_165)] border-[oklch(0.88_0.06_150)]';
            return (
              <button
                type="button"
                key={type}
                onClick={() => toggleTypeFilter(type)}
                className={`px-3 py-0.5 rounded-full border text-[11px] font-medium shrink-0 cursor-pointer capitalize ${
                  isActive ? activeColorClass : 'bg-transparent text-[#5f6368] border-[#dadce0]'
                }`}
              >
                {type}
              </button>
            );
          })}
          {visibleTags.map(tag => {
            const isActive = activeUserFilters.includes(tag);
            return (
              <button
                type="button"
                key={tag}
                onClick={() => toggleUserFilter(tag)}
                className={`px-3 py-0.5 rounded-full border text-[11px] font-medium shrink-0 cursor-pointer ${
                  isActive ? 'bg-[#202124] text-white border-[#202124]' : 'bg-transparent text-[#5f6368] border-[#dadce0]'
                }`}
              >
                {tag}
              </button>
            );
          })}
          {overflowTags.length > 0 && (
            <TagSearchOverlay
              availableTags={overflowTags}
              activeTags={activeUserFilters}
              onSelectTag={toggleUserFilter}
              isDesktop={isDesktop}
            />
          )}
        </div>
      )}

      {/* Work items list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {filteredPieces.length === 0 ? (
          <div className="p-8 text-center border border-dashed rounded-xl bg-white border-[#dadce0]">
            <p className="text-sm text-[#80868b] mb-4">{t('noMatches')}</p>
            <Button variant="outline" size="sm" onClick={clearFilters}>{t('clearFilters')}</Button>
          </div>
        ) : (
          filteredPieces.map((piece) => {
            const typeTag = piece.tags?.find(t => t.kind === 'type');
            const typeDisplay = typeTag ? typeTag.value : piece.type;
            const displayBadgeClass = piece.type === 'poem'
              ? 'bg-[oklch(0.95_0.03_330)] text-[oklch(0.42_0.13_335)]'
              : 'bg-[oklch(0.95_0.03_150)] text-[oklch(0.38_0.1_165)]';

            return (
              <Link
                key={piece.id}
                to={`/work/${piece.id}`}
                className="flex items-center gap-3 p-3.5 mb-2 bg-white border border-[#e8eaed] rounded-xl hover:bg-neutral-50/50 transition-colors w-full"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f1f3f4] text-[#5f6368] shrink-0">
                  {piece.type === 'poem' ? <Feather className="h-4.5 w-4.5" /> : <FileText className="h-4.5 w-4.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[15px] font-medium text-[#202124] truncate">
                    {piece.title}
                  </div>
                  <div className="mt-0.5 text-xs text-[#80868b]">
                    {new Date(piece.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-medium ${displayBadgeClass}`}>
                    {typeDisplay}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#80868b]" />
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Floating Action Button (FAB) for New Work */}
      <div className="fixed right-4 bottom-5 z-40">
        <button
          type="button"
          onClick={handleNewWorkClick}
          className="bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-lg h-12 px-5 rounded-full flex items-center gap-2 font-semibold text-sm active:scale-95 transition-transform"
        >
          <Plus className="h-4.5 w-4.5 text-white" />
          {t('newWork')}
        </button>
      </div>
    </div>
  );
}
