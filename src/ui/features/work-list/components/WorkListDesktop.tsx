import { Link } from 'react-router-dom';
import { Button } from '@/ui/components/ui/button';
import { TagSearchOverlay } from './TagSearchOverlay';
import {
  Plus,
  Download,
  Upload,
  Search,
  Settings,
  Feather,
  FileText,
  Eye,
  Edit,
  Tag
} from 'lucide-react';
import type { Piece, PieceContent } from '@/core/domain/types/';
import { toast } from 'sonner';
import type { TranslationKey } from '@/ui/hooks/use-translation';

interface WorkListDesktopProps {
  visiblePieces: Piece[];
  filteredPieces: Piece[];
  availableUserTags: string[];
  activeTypeFilters: string[];
  activeUserFilters: string[];
  toggleTypeFilter: (type: string) => void;
  toggleUserFilter: (tag: string) => void;
  clearFilters: () => void;
  selectedPieceId: string | null;
  setSelectedPieceId: (id: string | null) => void;
  currentPiece: Piece | null;
  isExporting: boolean;
  exportBackup: () => void;
  setIsRestoreModalOpen: (open: boolean) => void;
  handleNewWorkClick: () => void;
  handleEditClick: (pieceId: string) => void;
  isDesktop: boolean;
  t: (key: TranslationKey) => string;
  uiLanguage: 'es' | 'en';
  setUILanguage: (lang: 'es' | 'en') => void;
}

function renderPreviewContent(content: PieceContent) {
  if (content.kind === 'song') {
    return <p className="text-[#80868b]">Song visualization is not supported in MVP.</p>;
  }

  return (
    <div className="space-y-4 font-serif leading-relaxed text-[#202124]">
      {content.blocks.slice(0, 5).map((block) => {
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
              <h2 key={block.id} className="text-xl font-bold tracking-tight text-[#202124] mt-6 mb-2 animate-none">
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
              <div key={block.id} className="min-h-[1.5rem]">
                {renderedRuns.length > 0 ? renderedRuns : <br />}
              </div>
            );
          case 'paragraph':
          default:
            return (
              <p key={block.id} className="min-h-[1.5rem]">
                {renderedRuns.length > 0 ? renderedRuns : <br />}
              </p>
            );
        }
      })}
    </div>
  );
}

export function WorkListDesktop({
  visiblePieces,
  filteredPieces,
  availableUserTags,
  activeTypeFilters,
  activeUserFilters,
  toggleTypeFilter,
  toggleUserFilter,
  clearFilters,
  selectedPieceId,
  setSelectedPieceId,
  currentPiece,
  isExporting,
  exportBackup,
  setIsRestoreModalOpen,
  handleNewWorkClick,
  handleEditClick,
  isDesktop,
  t,
  uiLanguage,
  setUILanguage
}: Readonly<WorkListDesktopProps>) {
  const visibleLimit = 4;
  const visibleTags = availableUserTags.slice(0, visibleLimit);
  const overflowTags = availableUserTags.slice(visibleLimit);

  const MVP_VISIBLE_TYPES = ['text', 'poem'];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] overflow-hidden select-none">
      {/* App Chrome */}
      <div className="h-[52px] px-5 flex items-center justify-between border-b border-[#e8eaed] bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-base text-[#202124] tracking-tight">
            NoteDraftForge
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#dadce0] overflow-hidden">
            <button
              type="button"
              onClick={() => setUILanguage('es')}
              className={`h-[30px] px-[10px] text-xs font-semibold border-0 cursor-pointer ${
                uiLanguage === 'es' ? 'bg-[#202124] text-white' : 'bg-transparent text-[#5f6368] hover:bg-[#f1f3f4]'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setUILanguage('en')}
              className={`h-[30px] px-[10px] text-xs font-semibold border-0 cursor-pointer ${
                uiLanguage === 'en' ? 'bg-[#202124] text-white' : 'bg-transparent text-[#5f6368] hover:bg-[#f1f3f4]'
              }`}
            >
              EN
            </button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => toast.info(t('settings'))}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Rail Sidebar */}
        <aside className="w-[320px] shrink-0 border-r border-[#e8eaed] bg-white flex flex-col h-[calc(100vh-52px)] relative">
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between border-b border-[#e8eaed]">
            <span className="font-sans text-xs font-bold text-[#202124] uppercase tracking-wider">{t('works')}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => toast.info(t('search'))}>
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={handleNewWorkClick} title={t('newWork')}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={() => setIsRestoreModalOpen(true)} title={t('restoreBackup')}>
                <Upload className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#5f6368]" onClick={exportBackup} disabled={isExporting} title={t('exportBackup')}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter chips bar */}
          {visiblePieces.length > 0 && (
            <div className="p-3 flex flex-wrap gap-1.5 border-b border-[#e8eaed] shrink-0">
              <button
                type="button"
                onClick={clearFilters}
                className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                  activeTypeFilters.length === 0 && activeUserFilters.length === 0
                    ? 'bg-[#202124] text-white border-[#202124]'
                    : 'bg-transparent text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
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
                    className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer capitalize ${
                      isActive ? activeColorClass : 'bg-transparent text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
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
                    className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium transition-colors cursor-pointer ${
                      isActive ? 'bg-[#202124] text-white border-[#202124]' : 'bg-transparent text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
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

          {/* Works list */}
          <div className="flex-1 overflow-y-auto">
            {filteredPieces.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-[#80868b]">{t('noMatches')}</p>
              </div>
            ) : (
              filteredPieces.map((piece) => {
                const isSelected = selectedPieceId === piece.id;
                const typeTag = piece.tags?.find(t => t.kind === 'type');
                const typeDisplay = typeTag ? typeTag.value : piece.type;
                const displayBadgeClass = piece.type === 'poem'
                  ? 'bg-[oklch(0.95_0.03_330)] text-[oklch(0.42_0.13_335)]'
                  : 'bg-[oklch(0.95_0.03_150)] text-[oklch(0.38_0.1_165)]';

                return (
                  <button
                    type="button"
                    key={piece.id}
                    onClick={() => setSelectedPieceId(piece.id)}
                    className={`w-full text-left border-0 cursor-pointer p-4 flex gap-3 border-b border-[#e8eaed] transition-colors ${
                      isSelected ? 'bg-[#e8f0fe] border-l-2 border-l-[#1a73e8]' : 'bg-transparent hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-[#1967d2]' : 'text-[#5f6368]'}`}>
                      {piece.type === 'poem' ? <Feather className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-sans text-sm font-medium truncate ${isSelected ? 'text-[#1967d2]' : 'text-[#202124]'}`}>
                        {piece.title}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-[#80868b]">
                        <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-medium ${displayBadgeClass}`}>
                          {typeDisplay}
                        </span>
                        <span>{new Date(piece.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Main preview */}
        <main className="flex-1 bg-[#f8f9fa] flex flex-col h-[calc(100vh-52px)] overflow-y-auto p-8">
          {currentPiece ? (
            <div className="max-w-2xl mx-auto w-full flex flex-col">
              {/* Details card header */}
              <div className="bg-white border border-[#e8eaed] rounded-xl p-6 shadow-sm flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                      currentPiece.type === 'poem' ? 'bg-[oklch(0.95_0.03_330)] text-[oklch(0.42_0.13_335)]' : 'bg-[oklch(0.95_0.03_150)] text-[oklch(0.38_0.1_165)]'
                    }`}>
                      {currentPiece.type}
                    </span>
                    <span className="bg-[#dcfce7] text-[#166534] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                      {t('snapshotReady')}
                    </span>
                    <span className="text-[11px] text-[#80868b]">
                      {t('updated')}: {new Date(currentPiece.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-sans text-2xl font-semibold text-[#202124] tracking-tight">
                    {currentPiece.title}
                  </h2>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {currentPiece.tags?.filter(t => t.kind === 'user').map((t) => (
                      <span key={t.value} className="inline-flex items-center gap-1 text-[11px] text-[#80868b]">
                        <Tag className="h-2.5 w-2.5" />#{t.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button variant="default" size="sm" asChild className="bg-[#1a73e8] hover:bg-[#1557b0] text-white">
                    <Link to={`/work/${currentPiece.id}`}>
                      <Eye className="h-4 w-4 mr-1.5" /> {t('viewButton')}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(currentPiece.id)}>
                    <Edit className="h-4 w-4 mr-1.5" /> {t('editButton')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportBackup} disabled={isExporting}>
                    <Download className="h-4 w-4 mr-1.5" /> {isExporting ? t('exporting') : t('exportBackup')}
                  </Button>
                </div>
              </div>

              {/* Content preview card */}
              <div className="bg-white border border-[#e8eaed] rounded-xl p-8 shadow-sm mt-6 flex-1 min-h-[300px]">
                <div className="text-[11px] font-bold text-[#80868b] uppercase tracking-widest border-b border-neutral-100 pb-3 mb-5">
                  {t('readingPreview')}
                </div>
                <div className="font-serif text-lg leading-relaxed text-[#202124]">
                  {renderPreviewContent(currentPiece.content)}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[#80868b] text-sm">{t('noMatches')}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
