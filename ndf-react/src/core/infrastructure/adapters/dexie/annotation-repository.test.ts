import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { DexieAnnotationRepository } from './annotation-repository';
import { db } from './db';
import type { Annotation } from '../../../domain/types/';

describe('DexieAnnotationRepository', () => {
  const repo = new DexieAnnotationRepository();

  beforeEach(async () => {
    await db.annotations.clear();
  });

  const dummyAnnotation: Annotation = {
    id: 'ann-1',
    pieceId: 'piece-1',
    kind: 'comment',
    target: { kind: 'text-node', blockId: 'b-1' },
    content: { shortNote: 'Some comment' },
    layerId: 'comments',
    status: 'valid'
  };

  it('saves and retrieves annotations by pieceId', async () => {
    await repo.save(dummyAnnotation);
    const retrieved = await repo.getByPieceId('piece-1');
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].id).toBe('ann-1');
  });

  it('deletes an annotation', async () => {
    await repo.save(dummyAnnotation);
    await repo.delete('ann-1');
    const retrieved = await repo.getByPieceId('piece-1');
    expect(retrieved).toHaveLength(0);
  });

  it('deletes annotations by pieceId', async () => {
    await repo.save(dummyAnnotation);
    await repo.deleteByPieceId('piece-1');
    const retrieved = await repo.getByPieceId('piece-1');
    expect(retrieved).toHaveLength(0);
  });
});
