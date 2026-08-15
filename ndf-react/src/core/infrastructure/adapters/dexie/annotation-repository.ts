import type { Annotation } from '../../../domain/types/';
import type { AnnotationRepository } from '../../../ports';
import { db } from './db';

export class DexieAnnotationRepository implements AnnotationRepository {
  async getByPieceId(pieceId: string): Promise<Annotation[]> {
    return db.annotations.where('pieceId').equals(pieceId).toArray();
  }

  async save(annotation: Annotation): Promise<void> {
    await db.annotations.put(annotation);
  }

  async delete(id: string): Promise<void> {
    await db.annotations.delete(id);
  }

  async deleteByPieceId(pieceId: string): Promise<void> {
    await db.annotations.where('pieceId').equals(pieceId).delete();
  }
}
