import type { AnnotationKind, LayerKind } from './layer';

export type AnnotationTarget =
  | TextRangeTarget
  | TextNodeTarget
  | SongCellTarget
  | SongCellRangeTarget;

export interface TextRangeTarget {
  kind: 'text-range';
  blockId: string;
  startOffset: number;   // inclusive
  endOffset: number;     // exclusive
}

export interface TextNodeTarget {
  kind: 'text-node';
  blockId: string;
  runId?: string;
}

export interface SongCellTarget {
  kind: 'song-cell';
  sectionId: string;
  cellId: string;
}

export interface SongCellRangeTarget {
  kind: 'song-cell-range';
  sectionId: string;
  startCellId: string;
  endCellId: string;
}

export interface Annotation {
  id: string;
  pieceId: string;
  target: AnnotationTarget;
  kind: AnnotationKind;
  content: AnnotationContent;
  layerId: LayerKind;
  status: AnnotationStatus;
}

export type AnnotationStatus = 'valid' | 'needsReview';

// breath — always chosen explicitly by the user, never derived
export interface BreathContent {
  mark: 'S' | 'L';
}

// intent and comment share a dual-level note structure:
//   shortNote   — brief phrase shown floating above the annotated text
//                 in the reading surface (Caveat handwriting font)
//   extendedNote — longer, optional note shown in the sidebar/detail
//                  view when the annotation is selected
//
// intent — personal interpretation notes, AI must never write here
// comment — technical/compositional notes, AI may write here in the future
export interface NoteAnnotationContent {
  shortNote: string;       // non-empty; displayed inline above text
  extendedNote?: string;   // optional; shown in detail sidebar on selection
}

export type IntentContent  = NoteAnnotationContent;
export type CommentContent = NoteAnnotationContent;

export type AnnotationContent =
  | BreathContent
  | IntentContent
  | CommentContent;

export interface PieceSnapshot {
  pieceId: string;
  html: string;                                // static HTML, all annotations included
  layerVisibility: Record<LayerKind, boolean>; // per-piece layer state
  sourceRevision: number;                      // exact Piece.revision used to generate this snapshot
  generatedAt: string;                         // ISO 8601
}
