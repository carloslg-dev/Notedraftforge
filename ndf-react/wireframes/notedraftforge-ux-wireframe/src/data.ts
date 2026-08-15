import type { Work, AnnotKind } from './design-system'

// ─── Works fixture ──────────────────────────────────────────────────────────

export const WORKS: Work[] = [
  {
    id: 'w1',
    title: 'El descanso del día',
    type: 'poem',
    language: 'ES',
    tags: ['stage', 'quiet'],
    updatedAt: 'Updated 6 min ago',
    snapshotState: 'stale',
    annotations: [
      {
        id: 'a1', kind: 'comment',
        shortNote: 'subrayar "silencio"',
        extendedNote: 'Dar el máximo peso rítmico a la palabra "silencio". Considerar si el verso necesita coma antes para separar la oración relativa. Abierto a revisión en la próxima lectura.',
        anchor: 'Line 3 · comment',
      },
      {
        id: 'a2', kind: 'intent',
        shortNote: 'más lento, voz casi rota',
        extendedNote: 'Reducir el tempo hasta casi detenerse en "pájaro". La imagen del pájaro exhausto pide entrega física — los hombros caen, la voz casi falla. No proyectar.',
        anchor: 'Line 1 · intention',
      },
      {
        id: 'a3', kind: 'breath',
        shortNote: 'pausa larga',
        extendedNote: 'Pausa de 2 tiempos completos. El silencio aquí es parte del significado.',
        anchor: 'Line 2 · breath',
      },
    ],
  },
  {
    id: 'w2',
    title: 'Notes on silence',
    type: 'text',
    language: 'EN',
    tags: ['draft', 'essay'],
    updatedAt: 'Updated yesterday',
    snapshotState: 'generating',
    annotations: [
      {
        id: 'a4', kind: 'comment',
        shortNote: 'waiting for snapshot',
        extendedNote: 'The UI should explain why comments are unavailable without feeling blocked.',
        anchor: 'Snapshot gate',
      },
    ],
  },
  {
    id: 'w3',
    title: 'Paper boats',
    type: 'poem',
    language: 'EN',
    tags: ['read-aloud', 'festival'],
    updatedAt: 'Updated 3 days ago',
    snapshotState: 'ready',
    annotations: [
      {
        id: 'a5', kind: 'comment',
        shortNote: 'keep open',
        extendedNote: 'Editorial comment already aligned to the current target. The line benefits from a longer vowel sound on the last syllable.',
        anchor: 'Line 2 · comment',
      },
      {
        id: 'a6', kind: 'breath',
        shortNote: 'long rest',
        extendedNote: 'Performance pacing for the festival reading cut.',
        anchor: 'Line 4 · breath',
      },
    ],
  },
  {
    id: 'w4',
    title: 'Small rooms',
    type: 'text',
    language: 'EN',
    tags: ['reflection'],
    updatedAt: 'Updated 8 days ago',
    snapshotState: 'ready',
    annotations: [
      {
        id: 'a7', kind: 'intent',
        shortNote: 'land plainly',
        extendedNote: 'An intention note can still guide interpretation even in prose. The final paragraph should resist the urge to explain itself.',
        anchor: 'Paragraph 3 · intention',
      },
    ],
  },
]

// ─── Poem content ────────────────────────────────────────────────────────────

export const POEM_HTML = `<p>Llega la tarde como un pájaro cansado,</p><p>y se posa en los tejados.</p><p></p><p>El sol guarda sus últimas monedas</p><p>en el bolsillo del horizonte.</p><p></p><p>Nadie sabe por qué duele tanto</p><p>lo que se va en silencio,</p><p>pero el alma lo reconoce</p><p>como se reconoce una casa.</p><p></p><p>Y entonces, respiramos.</p>`

// Segmented poem for the visualization reading surface.
//
// shortNote  → floats ABOVE the annotated text in Caveat (kept brief)
// extendedNote → shown in the desktop sidebar when the annotation is selected
// mark       → breath only: 'S' | 'L' — rendered as an inline pill

export type PoemSeg = {
  text: string
  ann?: {
    kind: AnnotKind
    shortNote: string
    extendedNote?: string
    mark?: string
  }
}
export type PoemPara = PoemSeg[]

export const POEM_PARAS: PoemPara[] = [
  [
    { text: 'Llega la tarde como un ' },
    { text: 'pájaro cansado', ann: {
      kind: 'intent',
      shortNote: 'más lento, voz casi rota',
      extendedNote: 'Reducir el tempo hasta casi detenerse en "pájaro". La imagen del pájaro exhausto pide entrega física — los hombros caen, la voz casi falla. No proyectar.',
    }},
    { text: ', y se posa en los tejados.' },
  ],
  [
    { text: 'El sol guarda sus últimas monedas' },
    { text: ' ', ann: { kind: 'breath', shortNote: 'pausa larga', mark: 'L' }},
    { text: ' en el bolsillo del horizonte.' },
  ],
  [
    { text: 'Nadie sabe por qué duele tanto ' },
    { text: 'lo que se va en silencio', ann: {
      kind: 'comment',
      shortNote: 'subrayar "silencio"',
      extendedNote: 'Dar el máximo peso rítmico a "silencio". Considerar si el verso necesita coma antes para separar la oración relativa. Abierto a revisión.',
    }},
    { text: ', pero el alma lo reconoce como se reconoce una casa.' },
  ],
  [
    { text: 'Y entonces,' },
    { text: ' ', ann: { kind: 'breath', shortNote: 'pausa corta', mark: 'S' }},
    { text: ' respiramos', ann: {
      kind: 'intent',
      shortNote: 'abrir el pecho',
      extendedNote: 'El único momento en que el cuerpo actúa. Expandir el pecho durante la lectura — el oyente lo percibe aunque no sea visible. Momento de quietud antes del silencio final.',
    }},
    { text: '.' },
  ],
]
