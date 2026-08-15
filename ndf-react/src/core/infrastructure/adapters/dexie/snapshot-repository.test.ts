import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { DexieSnapshotRepository } from './snapshot-repository';
import { db } from './db';
import type { PieceSnapshot } from '../../../domain/types/';

describe('DexieSnapshotRepository', () => {
  const repo = new DexieSnapshotRepository();

  beforeEach(async () => {
    await db.snapshots.clear();
  });

  const dummySnapshot: PieceSnapshot = {
    pieceId: 'piece-1',
    html: '<p>Reading text</p>',
    sourceRevision: 1,
    layerVisibility: { comments: true, intention: true, breath: true, chord: true, meter: true },
    generatedAt: new Date().toISOString()
  };

  it('saves and retrieves a snapshot by pieceId', async () => {
    await repo.save(dummySnapshot);
    const retrieved = await repo.getByPieceId('piece-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.html).toBe('<p>Reading text</p>');
  });

  it('returns null if snapshot does not exist', async () => {
    const retrieved = await repo.getByPieceId('non-existent');
    expect(retrieved).toBeNull();
  });

  it('deletes a snapshot by pieceId', async () => {
    await repo.save(dummySnapshot);
    await repo.deleteByPieceId('piece-1');
    const retrieved = await repo.getByPieceId('piece-1');
    expect(retrieved).toBeNull();
  });
});
