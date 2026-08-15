import { describe, it, expect, beforeEach } from 'vitest';
import { UpdatePieceMetadataUseCase } from './update-piece-metadata.use-case';
import { PieceRepository } from '../../ports';
import { Piece } from '../../domain/types/';
import { createPiece } from '../../domain/factories';

class MockPieceRepository implements PieceRepository {
  private pieces = new Map<string, Piece>();

  async getAll(): Promise<Piece[]> {
    return Array.from(this.pieces.values());
  }

  async getById(id: string): Promise<Piece | null> {
    return this.pieces.get(id) || null;
  }

  async save(piece: Piece): Promise<void> {
    this.pieces.set(piece.id, piece);
  }

  async delete(id: string): Promise<void> {
    this.pieces.delete(id);
  }
}

describe('UpdatePieceMetadataUseCase', () => {
  let repository: MockPieceRepository;
  let useCase: UpdatePieceMetadataUseCase;
  let stubPiece: Piece;

  beforeEach(async () => {
    repository = new MockPieceRepository();
    useCase = new UpdatePieceMetadataUseCase(repository);

    // Create a stub piece to update
    stubPiece = createPiece({
      title: 'Original Title',
      type: 'text',
      language: 'en',
      tags: ['original-user-tag']
    });
    // Manually set a revision for testing
    stubPiece.revision = 5;

    await repository.save(stubPiece);
  });

  it('updates title and refreshes updatedAt without changing revision', async () => {
    const originalUpdatedAt = stubPiece.updatedAt;

    // Slight delay to ensure updatedAt would be different if using Date.now()
    await new Promise(resolve => setTimeout(resolve, 10));

    const updatedPiece = await useCase.execute({
      pieceId: stubPiece.id,
      title: 'New Title'
    });

    expect(updatedPiece.title).toBe('New Title');
    expect(updatedPiece.updatedAt).not.toBe(originalUpdatedAt);
    expect(updatedPiece.revision).toBe(5); // Revision unchanged
    expect(updatedPiece.language).toBe('en'); // other fields preserved

    const savedPiece = await repository.getById(stubPiece.id);
    expect(savedPiece).toEqual(updatedPiece);
  });

  it('adds and removes user tags successfully', async () => {
    const updatedPiece = await useCase.execute({
      pieceId: stubPiece.id,
      tags: ['new-user-tag', 'another-tag']
    });

    expect(updatedPiece.tags).toHaveLength(3); // 1 type tag + 2 user tags

    const userTags = updatedPiece.tags.filter(t => t.kind === 'user');
    expect(userTags).toHaveLength(2);
    expect(userTags.map(t => t.value).sort()).toEqual(['another-tag', 'new-user-tag']);

    // The type tag is still there
    const typeTags = updatedPiece.tags.filter(t => t.kind === 'type');
    expect(typeTags).toHaveLength(1);
    expect(typeTags[0].value).toBe('text');
  });

  it('cannot modify the type tag via this use case', async () => {
    // try to pass a tag that looks like a type tag or just user tags
    const updatedPiece = await useCase.execute({
      pieceId: stubPiece.id,
      tags: ['poem'] // even if we pass the value 'poem', it gets saved as kind='user'
    });

    const typeTags = updatedPiece.tags.filter(t => t.kind === 'type');
    expect(typeTags).toHaveLength(1);
    expect(typeTags[0].value).toBe('text'); // Original type tag preserved

    const userTags = updatedPiece.tags.filter(t => t.kind === 'user');
    expect(userTags).toHaveLength(1);
    expect(userTags[0].value).toBe('poem'); // Added as user tag
  });

  it('throws an error if piece is not found', async () => {
    await expect(useCase.execute({
      pieceId: 'non-existent-id',
      title: 'New Title'
    })).rejects.toThrow('Piece with id non-existent-id not found');
  });

  it('does not change updatedAt if no actual changes are made', async () => {
    const originalUpdatedAt = stubPiece.updatedAt;

    const updatedPiece = await useCase.execute({
      pieceId: stubPiece.id,
      title: 'Original Title', // Same as original
      language: 'en',          // Same as original
      tags: ['original-user-tag'] // Same as original
    });

    expect(updatedPiece.updatedAt).toBe(originalUpdatedAt);
    expect(updatedPiece.revision).toBe(5);
  });
});
