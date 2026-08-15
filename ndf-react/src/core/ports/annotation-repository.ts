import type { Annotation } from '../domain/types/';

export interface AnnotationRepository {
  getByPieceId(pieceId: string): Promise<Annotation[]>;
  save(annotation: Annotation): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
}
