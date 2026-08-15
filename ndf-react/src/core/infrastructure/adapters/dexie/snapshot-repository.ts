import type { PieceSnapshot } from '../../../domain/types/';
import type { SnapshotRepository } from '../../../ports';
import { db } from './db';

export class DexieSnapshotRepository implements SnapshotRepository {
  async getByPieceId(pieceId: string): Promise<PieceSnapshot | null> {
    const snapshot = await db.snapshots.get(pieceId);
    return snapshot ?? null;
  }

  async save(snapshot: PieceSnapshot): Promise<void> {
    await db.snapshots.put(snapshot);
  }

  async deleteByPieceId(pieceId: string): Promise<void> {
    await db.snapshots.delete(pieceId);
  }
}
