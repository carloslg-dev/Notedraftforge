export interface Piece {
  id: string;             // UUID, generated on creation
  title: string;          // non-empty string
  type: PieceType;
  content: PieceContent;  // structured canonical content (not raw Markdown)
  language: string;       // ISO 639-1 code (e.g. 'en', 'es', 'ca')
  tags: TagRef[];         // structured tags; type semantics are explicit via tag kind
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
  revision: number;       // monotonically increasing internal counter for snapshot freshness
}

export type PieceType = 'text' | 'poem' | 'song';

export type PieceContent = TextPieceContent | PoemPieceContent | SongPieceContent;

export interface TextPieceContent {
  kind: 'text';
  blocks: TextBlock[];
}

export interface PoemPieceContent {
  kind: 'poem';
  blocks: TextBlock[];
}

export interface SongPieceContent {
  kind: 'song';
  sections: SongSection[];
}

export interface TextBlock {
  id: string;
  kind: 'paragraph' | 'line' | 'heading' | 'quote';
  runs: TextRun[];
}

export interface TextRun {
  id: string;
  text: string;
  marks?: TextMark[];
}

export type TextMark = 'bold' | 'italic' | 'underline';

export interface SongSection {
  id: string;
  kind: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'outro' | 'custom';
  label?: string;       // required when kind = 'custom'
  cells: SongCell[];
}

export interface SongCell {
  id: string;
  text: string;
  chord?: ChordContent; // owned by the SongCell, not by Annotation
  meter?: string;       // owned by the SongCell, not by Annotation, e.g. "4/4", "3/4"
}

export interface ChordContent {
  root: MusicalRoot;
  modifiers: MusicalModifier[];   // ordered, may be empty
  display: string;                // derived and stored, e.g. "C#m7"
}

export type MusicalRoot = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// Modifier order is always: [alteration?, mode?, extension?]
// alteration: sharp | flat (mutually exclusive)
// mode: minor | major (mutually exclusive)
// extension: seventh
export type MusicalModifier = 'sharp' | 'flat' | 'minor' | 'major' | 'seventh';

export interface TagRef {
  kind: TagKind;
  value: string;
}

export type TagKind = 'type' | 'user';
