import type { PieceSnapshot } from '../domain/types/';

export interface SnapshotRepository {
  getByPieceId(pieceId: string): Promise<PieceSnapshot | null>;
  save(snapshot: PieceSnapshot): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
}
