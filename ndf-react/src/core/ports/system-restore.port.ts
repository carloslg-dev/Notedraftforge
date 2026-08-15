import type { Piece, Annotation, PieceSnapshot } from '../domain/types/';

export interface SystemRestorePort {
  replaceAllData(
    pieces: Piece[],
    annotations: Annotation[],
    snapshots: PieceSnapshot[]
  ): Promise<void>;
}
