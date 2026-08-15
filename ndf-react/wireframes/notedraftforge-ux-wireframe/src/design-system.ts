// NoteDraftForge — shared design tokens and types

export type ScreenId =
  | 'WorkListDesktop'
  | 'WorkListMobile'
  | 'VisualizationDesktop'
  | 'VisualizationMobile'
  | 'EditorDesktop'
  | 'EditorMobile'
  | 'AnnotationModal'     // unified modal: type selector + shortNote + extendedNote
  | 'SelectionRefine'     // char-by-char boundary adjuster (mobile fat-finger fix)
  | 'ExportImport'        // backup modal: export JSON / restore from JSON
  | 'NewPiece'            // new work modal: title + type (text|poem) + content language

export type WorkType = 'poem' | 'text'
export type SnapshotState = 'ready' | 'stale' | 'generating'
export type AnnotKind = 'breath' | 'intent' | 'comment'
export type LayerKey = 'intention' | 'comments' | 'breath'
export type LayerState = Record<LayerKey, boolean>

// ─── Annotation note model ────────────────────────────────────────────────────
//
// Each annotation carries two levels of text:
//
//   shortNote   — a brief phrase shown floating ABOVE the annotated text in the
//                 reading surface (rendered in Caveat handwriting font). Designed
//                 to be readable at a glance without interrupting the poem flow.
//                 Example: "más lento, voz casi rota"
//
//   extendedNote — a longer, free-form note shown in the right sidebar when the
//                  annotation is selected (desktop) or in a detail sheet (future
//                  mobile). Can include interpretation context, editorial rationale,
//                  or performance detail that would be too long to float inline.
//                  Example: "Reducir el tempo hasta casi detenerse. La imagen del
//                  pájaro exhausto pide entrega física: los hombros caen..."
//
// For breath annotations, shortNote is not shown as a floating label — the mark
// (S / L) is the inline visual. extendedNote is optional and not yet surfaced in UI.

export type AnnotCard = {
  id: string
  kind: AnnotKind
  shortNote: string
  extendedNote: string
  anchor: string        // display reference e.g. "Line 3 · comment"
}

export type Work = {
  id: string
  title: string
  type: WorkType
  language: string
  tags: string[]
  updatedAt: string
  snapshotState: SnapshotState
  annotations: AnnotCard[]
}

// The data passed upward when the user selects an annotated segment in the
// reading surface, used to populate the sidebar extended note panel.
export type ActiveAnn = {
  segId: string
  kind: AnnotKind
  shortNote: string
  extendedNote?: string
}

// Colors — warm-neutral palette (mirrors Claude Design canvas)
export const C = {
  bg: '#f8f9fa',
  surface: '#ffffff',
  surfaceAlt: '#f1f3f4',
  ink: '#202124',
  inkMute: '#5f6368',
  inkSoft: '#80868b',
  line: '#dadce0',
  lineSoft: '#e8eaed',
  accent: '#1a73e8',
  accentSoft: '#e8f0fe',
  accentInk: '#1967d2',
  intent:  { bg: '#fef7e0', ink: '#b06000', border: '#f6d068' },
  comment: { bg: '#e6f4ea', ink: '#137333', border: '#81c995' },
  breath:  { bg: '#e8f0fe', ink: '#1967d2', border: '#8ab4f8' },
  warn: '#d93025',
} as const

// Fonts
export const F = {
  ui:    "'Google Sans', 'Roboto', system-ui, sans-serif",
  serif: "'Source Serif 4', Georgia, serif",
  mono:  "'JetBrains Mono', ui-monospace, Menlo, monospace",
  hand:  "'Caveat', cursive",
} as const

export function kindStyle(kind: AnnotKind) {
  return kind === 'intent' ? C.intent : kind === 'comment' ? C.comment : C.breath
}
