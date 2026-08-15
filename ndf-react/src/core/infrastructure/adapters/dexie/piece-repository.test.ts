import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { DexiePieceRepository } from './piece-repository';
import { db } from './db';
import type { Piece } from '../../../domain/types/';

describe('DexiePieceRepository', () => {
  const repo = new DexiePieceRepository();

  beforeEach(async () => {
    await db.pieces.clear();
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

  it('saves and retrieves a piece', async () => {
    await repo.save(dummyPiece);
    const retrieved = await repo.getById('piece-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Poem of Fire');
  });

  it('returns null if piece does not exist', async () => {
    const retrieved = await repo.getById('non-existent');
    expect(retrieved).toBeNull();
  });

  it('retrieves all pieces', async () => {
    await repo.save(dummyPiece);
    const list = await repo.getAll();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('piece-1');
  });

  it('deletes a piece', async () => {
    await repo.save(dummyPiece);
    await repo.delete('piece-1');
    const retrieved = await repo.getById('piece-1');
    expect(retrieved).toBeNull();
  });
});
