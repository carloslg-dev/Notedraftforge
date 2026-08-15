import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { DexieSystemRestoreRepository } from './system-restore-repository';
import { db } from './db';
import type { Piece, Annotation, PieceSnapshot } from '../../../domain/types/';

describe('DexieSystemRestoreRepository', () => {
  const repo = new DexieSystemRestoreRepository();

  beforeEach(async () => {
    await db.pieces.clear();
    await db.annotations.clear();
    await db.snapshots.clear();
  });

  const dummyPiece: Piece = {
    id: 'piece-1',
    title: 'Poem of Fire',
    type: 'poem',
    content: { kind: 'poem', blocks: [] },
    language: 'es',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 1,
    tags: []
  };

  const dummyAnnotation: Annotation = {
    id: 'ann-1',
    pieceId: 'piece-1',
    kind: 'comment',
    target: { kind: 'text-node', blockId: 'b-1' },
    content: { shortNote: 'Some comment' },
    layerId: 'comments',
    status: 'valid'
  };

  const dummySnapshot: PieceSnapshot = {
    pieceId: 'piece-1',
    html: '<p>Reading text</p>',
    sourceRevision: 1,
    layerVisibility: { comments: true, intention: true, breath: true, chord: true, meter: true },
    generatedAt: new Date().toISOString()
  };

  it('replaces all data in an atomic transaction', async () => {
    // 1. Put some initial dirty data in the DB
    await db.pieces.put({ ...dummyPiece, id: 'dirty-piece' });
    await db.annotations.put({ ...dummyAnnotation, id: 'dirty-ann' });

    // 2. Perform replace all data
    await repo.replaceAllData([dummyPiece], [dummyAnnotation], [dummySnapshot]);

    // 3. Verify dirty data is wiped
    const pieces = await db.pieces.toArray();
    const annotations = await db.annotations.toArray();
    const snapshots = await db.snapshots.toArray();

    expect(pieces).toHaveLength(1);
    expect(pieces[0].id).toBe('piece-1');

    expect(annotations).toHaveLength(1);
    expect(annotations[0].id).toBe('ann-1');

    expect(snapshots).toHaveLength(1);
    expect(snapshots[0].pieceId).toBe('piece-1');
  });
});
