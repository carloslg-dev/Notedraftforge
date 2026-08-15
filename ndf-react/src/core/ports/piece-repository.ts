import type { Piece } from '../domain/types/';

export interface PieceRepository {
  getAll(): Promise<Piece[]>;
  getById(id: string): Promise<Piece | null>;
  save(piece: Piece): Promise<void>;
  delete(id: string): Promise<void>;
}
