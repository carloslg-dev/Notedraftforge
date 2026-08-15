export interface Layer {
  id: LayerKind;
  source: LayerSourceKind;
}

export type LayerKind =
  | 'chord'
  | 'meter'
  | 'breath'
  | 'intention'
  | 'comments';

export type AnnotationKind = 'breath' | 'intent' | 'comment';
export type SongCellPropertyKind = 'chord' | 'meter';
export type LayerSourceKind = AnnotationKind | SongCellPropertyKind;
