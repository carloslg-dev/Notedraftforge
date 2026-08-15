import { describe, it, expect, vi, beforeEach, type Mocked } from 'vitest';
import { GetPieceUseCase } from './get-piece.use-case';
import { PieceRepository } from '../../ports';
import { Piece } from '../../domain/types/';

describe('GetPieceUseCase', () => {
  let mockRepository: Mocked<PieceRepository>;
  let useCase: GetPieceUseCase;

  beforeEach(() => {
    mockRepository = {
      getById: vi.fn(),
      getAll: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    useCase = new GetPieceUseCase(mockRepository);
  });

  it('should return a piece if found', async () => {
    const mockPiece: Piece = {
      id: '123',
      type: 'text',
      title: 'Test',
      language: 'en',
      content: { kind: 'text', blocks: [] },
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
      revision: 1,
      tags: [],
    };
    mockRepository.getById.mockResolvedValue(mockPiece);

    const result = await useCase.execute('123');
    expect(result).toBe(mockPiece);
    expect(mockRepository.getById).toHaveBeenCalledWith('123');
  });

  it('should return null if piece is not found', async () => {
    mockRepository.getById.mockResolvedValue(null);

    const result = await useCase.execute('999');
    expect(result).toBeNull();
    expect(mockRepository.getById).toHaveBeenCalledWith('999');
  });
});
