import { describe, it, expect, vi } from 'vitest';
import { GetAllPiecesUseCase } from './get-all-pieces.use-case';
import { PieceRepository } from '../../ports';
import { createPiece } from '../../domain/factories';

describe('GetAllPiecesUseCase', () => {
  it('should return all text and poem pieces sorted by updatedAt descending', async () => {
    const piece1 = createPiece({ title: 'Old Poem', type: 'poem', language: 'en' });
    // artificially set an older date
    Object.assign(piece1, { updatedAt: '2023-01-01T10:00:00.000Z' });

    const piece2 = createPiece({ title: 'New Text', type: 'text', language: 'en' });
    Object.assign(piece2, { updatedAt: '2023-01-02T10:00:00.000Z' });

    const piece3 = createPiece({ title: 'A Song', type: 'song', language: 'en' });
    Object.assign(piece3, { updatedAt: '2023-01-03T10:00:00.000Z' });

    const mockPieces = [piece1, piece2, piece3];

    const mockRepo: PieceRepository = {
      getAll: vi.fn().mockResolvedValue(mockPieces),
      getById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetAllPiecesUseCase(mockRepo);
    const result = await useCase.execute();

    expect(mockRepo.getAll).toHaveBeenCalled();
    expect(result).toHaveLength(2); // Song is filtered out

    // Ordered descending by date: piece2 (Jan 2) then piece1 (Jan 1)
    expect(result[0].id).toBe(piece2.id);
    expect(result[1].id).toBe(piece1.id);
  });

  it('should return an empty array if there are no pieces', async () => {
    const mockRepo: PieceRepository = {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    const useCase = new GetAllPiecesUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
