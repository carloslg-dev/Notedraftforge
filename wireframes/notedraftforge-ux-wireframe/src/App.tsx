import { useMemo, useState } from 'react';

type ScreenId =
  | 'WorkListDesktop'
  | 'WorkListMobile'
  | 'PieceVisualizationDesktop'
  | 'PieceVisualizationMobile'
  | 'PieceEditingDesktop'
  | 'PieceEditingMobile'
  | 'AnnotationModalDesktop'
  | 'AnnotationModalMobileBottomSheet';

type WorkType = 'poem' | 'text';

type WorkItem = {
  id: string;
  title: string;
  type: WorkType;
  updatedAtLabel: string;
  userTags: string[];
};

const SCREENS: ScreenId[] = [
  'WorkListDesktop',
  'WorkListMobile',
  'PieceVisualizationDesktop',
  'PieceVisualizationMobile',
  'PieceEditingDesktop',
  'PieceEditingMobile',
  'AnnotationModalDesktop',
  'AnnotationModalMobileBottomSheet',
];

const WORKS: WorkItem[] = [
  { id: 'w-1', title: 'El descanso del día', type: 'poem', updatedAtLabel: '1 week ago', userTags: ['quiet', 'stage'] },
  { id: 'w-2', title: 'Notes on silence', type: 'text', updatedAtLabel: '2 weeks ago', userTags: ['draft'] },
  { id: 'w-3', title: 'Paper boats', type: 'poem', updatedAtLabel: '3 weeks ago', userTags: ['read-aloud'] },
  { id: 'w-4', title: 'Small rooms', type: 'text', updatedAtLabel: '1 month ago', userTags: ['reflection'] },
];

const FILTERS: Array<'all' | WorkType> = ['all', 'poem', 'text'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('WorkListDesktop');
  const [activeFilter, setActiveFilter] = useState<'all' | WorkType>('all');

  const filteredWorks = useMemo(
    () => (activeFilter === 'all' ? WORKS : WORKS.filter((item) => item.type === activeFilter)),
    [activeFilter],
  );

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/90 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-zinc-500">NoteDraftForge wireframe</p>
            <h1 className="text-lg font-semibold">MVP poem/text UX baseline (React + Tailwind)</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {SCREENS.map((screen) => (
              <button
                key={screen}
                type="button"
                onClick={() => setCurrentScreen(screen)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  currentScreen === screen ? 'bg-blue-600 text-white' : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                }`}
              >
                {screen}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl justify-center p-4 md:p-8">
        {currentScreen === 'WorkListDesktop' && (
          <WorkListDesktop works={filteredWorks} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        )}
        {currentScreen === 'WorkListMobile' && (
          <WorkListMobile works={filteredWorks} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        )}
        {currentScreen === 'PieceVisualizationDesktop' && <PieceVisualizationDesktop />}
        {currentScreen === 'PieceVisualizationMobile' && <PieceVisualizationMobile />}
        {currentScreen === 'PieceEditingDesktop' && <PieceEditingDesktop />}
        {currentScreen === 'PieceEditingMobile' && <PieceEditingMobile />}
        {currentScreen === 'AnnotationModalDesktop' && <AnnotationModalDesktop />}
        {currentScreen === 'AnnotationModalMobileBottomSheet' && <AnnotationModalMobileBottomSheet />}
      </main>
    </div>
  );
}

function TypeBadge({ type }: { type: WorkType }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        type === 'poem' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      {type}
    </span>
  );
}

function FilterChips({ activeFilter, onFilterChange }: { activeFilter: 'all' | WorkType; onFilterChange: (v: 'all' | WorkType) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            activeFilter === filter ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}

function WorkListDesktop({ works, activeFilter, onFilterChange }: { works: WorkItem[]; activeFilter: 'all' | WorkType; onFilterChange: (v: 'all' | WorkType) => void }) {
  return (
    <section className="w-full max-w-5xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Works</h2>
          <p className="text-sm text-zinc-500">Poem + text only in MVP wireframe.</p>
        </div>
        <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">+ Create work</button>
      </div>
      <div className="mb-5">
        <FilterChips activeFilter={activeFilter} onFilterChange={onFilterChange} />
      </div>
      <div className="space-y-3">
        {works.map((work) => (
          <article key={work.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
            <div>
              <h3 className="text-lg font-semibold">{work.title}</h3>
              <p className="text-sm text-zinc-500">{work.updatedAtLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {work.userTags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-white px-2 py-1 text-xs text-zinc-500">#{tag}</span>
              ))}
              <TypeBadge type={work.type} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function WorkListMobile({ works, activeFilter, onFilterChange }: { works: WorkItem[]; activeFilter: 'all' | WorkType; onFilterChange: (v: 'all' | WorkType) => void }) {
  return (
    <section className="relative w-[360px] rounded-[28px] border border-zinc-300 bg-zinc-100 p-4 shadow-lg">
      <h2 className="mb-2 text-4xl font-bold tracking-tight">Works</h2>
      <FilterChips activeFilter={activeFilter} onFilterChange={onFilterChange} />
      <div className="mt-4 space-y-2">
        {works.map((work) => (
          <article key={work.id} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3">
            <div>
              <h3 className="text-2xl font-semibold leading-tight">{work.title}</h3>
              <p className="text-sm text-zinc-500">{work.updatedAtLabel}</p>
            </div>
            <TypeBadge type={work.type} />
          </article>
        ))}
      </div>
      <button className="absolute bottom-6 right-5 grid h-14 w-14 place-items-center rounded-full bg-blue-600 text-3xl text-white shadow-lg">+</button>
    </section>
  );
}

function PieceVisualizationDesktop() {
  return (
    <section className="flex h-[740px] w-full max-w-6xl overflow-hidden rounded-3xl border border-zinc-300 bg-zinc-100">
      <div className="flex-1 border-r border-zinc-200 px-16 pt-12">
        <span className="rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-semibold text-fuchsia-700">poem</span>
        <h2 className="mt-4 text-5xl font-bold">El descanso del día</h2>
        <div className="mt-8 max-w-3xl space-y-7 text-[42px] leading-[1.45] text-zinc-900">
          {/* snapshot content is mock HTML/visual reference */}
          <p>Llega la tarde como un pájaro cansado, y se posa en los tejados.</p>
          <p>El sol guarda sus últimas monedas <mark className="rounded bg-blue-100 px-1 text-blue-700">L</mark> en el bolsillo del horizonte.</p>
          <p>Nadie sabe por qué duele tanto <span className="underline decoration-emerald-700 decoration-2">lo que se va en silencio</span>.</p>
          <p>Y entonces, respiramos.</p>
        </div>
      </div>
      <aside className="w-[280px] bg-white p-6">
        <p className="text-xs font-bold tracking-[0.2em] text-zinc-400">LAYERS</p>
        <div className="mt-5 space-y-4">
          {/* layer toggles are mock UI only */}
          <LayerToggle name="Intention" subtitle="Personal" />
          <LayerToggle name="Comments" subtitle="Editorial" />
          <LayerToggle name="Breath" subtitle="S · L" />
        </div>
      </aside>
    </section>
  );
}

function PieceVisualizationMobile() {
  return (
    <section className="relative w-[390px] rounded-[30px] border border-zinc-300 bg-zinc-100 p-5 shadow-lg">
      <span className="rounded-full bg-fuchsia-100 px-2 py-1 text-xs font-semibold text-fuchsia-700">poem</span>
      <h2 className="mt-3 text-3xl font-bold">El descanso del día</h2>
      <div className="mt-6 space-y-4 text-[30px] leading-[1.5]">
        {/* snapshot content is mock HTML/visual reference */}
        <p>Llega la tarde como un pájaro cansado, y se posa en los tejados.</p>
        <p>Nadie sabe por qué duele tanto <span className="underline decoration-emerald-700">lo que se va en silencio</span>.</p>
        <p>Y entonces, respiramos.</p>
      </div>
      <button className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white">
        Layers
      </button>
      <div className="absolute inset-x-3 bottom-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-lg">
        <p className="mb-3 text-xs font-bold tracking-[0.2em] text-zinc-400">LAYER DRAWER</p>
        {/* layer toggles are mock UI only */}
        <div className="space-y-3">
          <LayerToggle name="Intention" subtitle="Personal" />
          <LayerToggle name="Comments" subtitle="Editorial" />
          <LayerToggle name="Breath" subtitle="S · L" />
        </div>
      </div>
    </section>
  );
}

function LayerToggle({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-zinc-50 p-3">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
      <span className="h-6 w-11 rounded-full bg-blue-600 p-1">
        <span className="block h-4 w-4 translate-x-5 rounded-full bg-white" />
      </span>
    </div>
  );
}

function PieceEditingDesktop() {
  return (
    <section className="w-full max-w-5xl rounded-3xl border border-zinc-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Editing mode</h2>
        <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white">Done / View</button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-zinc-100 px-3 py-1">language: ES</span>
        <span className="rounded-full bg-zinc-100 px-3 py-1">#poem</span>
        <span className="rounded-full bg-zinc-100 px-3 py-1">#stage</span>
      </div>
      {/* Tiptap placeholder area is not production editor */}
      <div className="min-h-[380px] rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6">
        <p className="text-sm font-semibold text-zinc-700">Structured editor placeholder</p>
        <p className="mt-2 text-sm text-zinc-500">Future adapter: Tiptap ↔ domain PieceContent mapping.</p>
      </div>
    </section>
  );
}

function PieceEditingMobile() {
  return (
    <section className="w-[390px] rounded-[28px] border border-zinc-300 bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">Editing</h2>
        <button className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white">Done / View</button>
      </div>
      <div className="mb-3 flex gap-2 text-xs">
        <span className="rounded-full bg-zinc-100 px-2 py-1">ES</span>
        <span className="rounded-full bg-zinc-100 px-2 py-1">#poem</span>
      </div>
      {/* Tiptap placeholder area is not production editor */}
      <div className="min-h-[300px] rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-4 text-sm text-zinc-500">
        Structured editor placeholder (mobile)
      </div>
    </section>
  );
}

function AnnotationModalDesktop() {
  return (
    <section className="relative h-[700px] w-full max-w-5xl rounded-3xl border border-zinc-300 bg-zinc-100 p-6">
      <div className="absolute inset-0 grid place-items-center bg-black/25">
        {/* annotation modal is visual only */}
        <article className="w-[560px] rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold">Add annotation</h2>
          <p className="mt-1 text-sm text-zinc-500">Visualization mode only; snapshot required.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm">breath</button>
            <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm">intention</button>
            <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm">comment</button>
          </div>
          <textarea className="mt-4 h-28 w-full rounded-xl border border-zinc-200 p-3 text-sm" placeholder="Annotation content" />
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-lg bg-zinc-100 px-4 py-2 text-sm">Cancel</button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Save</button>
          </div>
        </article>
      </div>
    </section>
  );
}

function AnnotationModalMobileBottomSheet() {
  return (
    <section className="relative h-[760px] w-[390px] rounded-[28px] border border-zinc-300 bg-zinc-100">
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl">
        {/* annotation modal is visual only */}
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-zinc-300" />
        <h2 className="text-lg font-bold">Add annotation</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-2 text-xs">breath</button>
          <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-2 text-xs">intention</button>
          <button className="rounded-lg border border-zinc-200 bg-zinc-100 px-2 py-2 text-xs">comment</button>
        </div>
        <textarea className="mt-4 h-24 w-full rounded-xl border border-zinc-200 p-3 text-sm" placeholder="Annotation content" />
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-lg bg-zinc-100 px-3 py-2 text-sm">Cancel</button>
          <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Save</button>
        </div>
      </div>
    </section>
  );
}
