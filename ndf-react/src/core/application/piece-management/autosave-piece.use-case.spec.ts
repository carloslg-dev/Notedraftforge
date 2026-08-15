import { describe, it, expect, vi } from 'vitest';
import { AutosavePieceUseCase } from './autosave-piece.use-case';
import type { Piece, PieceContent } from '../../domain/types/';
import type { PieceRepository } from '../../ports';

describe('AutosavePieceUseCase', () => {
  const dummyPiece: Piece = {
    id: 'piece-1',
    title: 'Autumn Poem',
    type: 'poem',
    content: { kind: 'poem', blocks: [] },
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 0,
    tags: []
  };

  const newContent: PieceContent = {
    kind: 'poem',
    blocks: [
      {
        id: 'b-1',
        kind: 'line',
        runs: [{ id: 'r-1', text: 'Autumn leaves falling down' }]
      }
    ]
  };

  it('updates content and increments piece revision', async () => {
    const mockPiecesRepo = {
      getById: vi.fn().mockResolvedValue(dummyPiece),
      save: vi.fn().mockResolvedValue(undefined),
      getAll: vi.fn(),
      delete: vi.fn()
    } as unknown as PieceRepository;

    const useCase = new AutosavePieceUseCase(mockPiecesRepo);
    const result = await useCase.execute({
      pieceId: 'piece-1',
      content: newContent
    });

    expect(mockPiecesRepo.getById).toHaveBeenCalledWith('piece-1');
    expect(result.content).toEqual(newContent);
    expect(result.revision).toBe(1);
    expect(mockPiecesRepo.save).toHaveBeenCalledWith(result);
  });

  it('throws error if piece is not found', async () => {
    const mockPiecesRepo = {
      getById: vi.fn().mockResolvedValue(null),
      save: vi.fn()
    } as unknown as PieceRepository;

    const useCase = new AutosavePieceUseCase(mockPiecesRepo);
    await expect(
      useCase.execute({ pieceId: 'invalid-id', content: newContent })
    ).rejects.toThrow('Piece not found: invalid-id');
  });
});
