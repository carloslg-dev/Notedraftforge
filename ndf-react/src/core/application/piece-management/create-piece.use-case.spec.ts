import { describe, it, expect, beforeEach } from 'vitest';
import { CreatePieceUseCase } from './create-piece.use-case';
import { PieceRepository } from '../../ports';
import { Piece } from '../../domain/types/';

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

describe('CreatePieceUseCase', () => {
  let repository: MockPieceRepository;
  let useCase: CreatePieceUseCase;

  beforeEach(() => {
    repository = new MockPieceRepository();
    useCase = new CreatePieceUseCase(repository);
  });

  it('creates and saves a piece of type text', async () => {
    const piece = await useCase.execute({
      title: 'My First Text',
      type: 'text',
      language: 'en'
    });

    expect(piece).toBeDefined();
    expect(piece.id).toBeDefined();
    expect(piece.title).toBe('My First Text');
    expect(piece.type).toBe('text');
    expect(piece.language).toBe('en');

    const savedPiece = await repository.getById(piece.id);
    expect(savedPiece).toEqual(piece);
  });

  it('creates and saves a piece of type poem', async () => {
    const piece = await useCase.execute({
      title: 'A Beautiful Poem',
      type: 'poem',
      language: 'es'
    });

    expect(piece).toBeDefined();
    expect(piece.type).toBe('poem');
    expect(piece.language).toBe('es');

    const savedPiece = await repository.getById(piece.id);
    expect(savedPiece).toEqual(piece);
  });

  it('rejects an empty title with validation error', async () => {
    await expect(useCase.execute({
      title: '   ',
      type: 'text',
      language: 'en'
    })).rejects.toThrow('Piece title cannot be empty');
  });

  it('rejects an invalid language code', async () => {
    await expect(useCase.execute({
      title: 'Valid Title',
      type: 'text',
      language: 'english' // Invalid, should be 2 letters
    })).rejects.toThrow('Language must be a valid ISO 639-1 two-letter code');
  });

  it('created Piece has exactly one type TagRef matching Piece.type', async () => {
    const piece = await useCase.execute({
      title: 'Tag Test',
      type: 'poem',
      language: 'fr'
    });

    const typeTags = piece.tags.filter((t) => t.kind === 'type');
    expect(typeTags).toHaveLength(1);
    expect(typeTags[0].value).toBe('poem');
  });

  // Note: the `song` type not being exposed in MVP UI is handled by typescript
  // in `CreatePieceCommand` limiting `type` to `'text' | 'poem'`.
});
