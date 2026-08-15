import type { SystemRestorePort } from '../../../ports';
import type { Piece, Annotation, PieceSnapshot } from '../../../domain/types/';
import { db } from './db';

export class DexieSystemRestoreRepository implements SystemRestorePort {
  async replaceAllData(
    pieces: Piece[],
    annotations: Annotation[],
    snapshots: PieceSnapshot[]
  ): Promise<void> {
    await db.transaction('rw', [db.pieces, db.annotations, db.snapshots], async () => {
      await db.pieces.clear();
      await db.annotations.clear();
      await db.snapshots.clear();

      if (pieces.length > 0) {
        await db.pieces.bulkAdd(pieces);
      }
      if (annotations.length > 0) {
        await db.annotations.bulkAdd(annotations);
      }
      if (snapshots.length > 0) {
        await db.snapshots.bulkAdd(snapshots);
      }
    });
  }
}
