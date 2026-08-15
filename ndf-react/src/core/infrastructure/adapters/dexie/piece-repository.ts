import type { Piece } from '../../../domain/types/';
import type { PieceRepository } from '../../../ports';
import { db } from './db';

export class DexiePieceRepository implements PieceRepository {
  async getAll(): Promise<Piece[]> {
    return db.pieces.toArray();
  }

  async getById(id: string): Promise<Piece | null> {
    const piece = await db.pieces.get(id);
    return piece ?? null;
  }

  async save(piece: Piece): Promise<void> {
    await db.pieces.put(piece);
  }

  async delete(id: string): Promise<void> {
    await db.pieces.delete(id);
  }
}
