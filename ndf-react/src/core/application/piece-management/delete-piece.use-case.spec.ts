import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DeletePieceUseCase } from './delete-piece.use-case';
import { AnnotationRepository, PieceRepository, SnapshotRepository } from '../../ports';

describe('DeletePieceUseCase', () => {
  let useCase: DeletePieceUseCase;
  let pieces: PieceRepository;
  let annotations: AnnotationRepository;
  let snapshots: SnapshotRepository;

  beforeEach(() => {
    pieces = {
      getAll: vi.fn(),
      getById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    annotations = {
      getByPieceId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      deleteByPieceId: vi.fn(),
    };
    snapshots = {
      getByPieceId: vi.fn(),
      save: vi.fn(),
      deleteByPieceId: vi.fn(),
    };

    useCase = new DeletePieceUseCase(pieces, annotations, snapshots);
  });

  it('deletes annotations, snapshots, and the piece in the correct order', async () => {
    // Arrange
    const pieceId = '123';
    let order = 0;

    const annotationsDeleteMock = vi.mocked(annotations.deleteByPieceId).mockImplementation(async () => {
      expect(order).toBe(0);
      order++;
    });

    const snapshotsDeleteMock = vi.mocked(snapshots.deleteByPieceId).mockImplementation(async () => {
      expect(order).toBe(1);
      order++;
    });

    const piecesDeleteMock = vi.mocked(pieces.delete).mockImplementation(async () => {
      expect(order).toBe(2);
      order++;
    });

    // Act
    await useCase.execute(pieceId);

    // Assert
    expect(annotationsDeleteMock).toHaveBeenCalledWith(pieceId);
    expect(snapshotsDeleteMock).toHaveBeenCalledWith(pieceId);
    expect(piecesDeleteMock).toHaveBeenCalledWith(pieceId);
    expect(order).toBe(3);
  });

  it('does not throw when deleting non-existent id (repositories resolve gracefully)', async () => {
    // Arrange
    const pieceId = 'non-existent-id';

    // Act & Assert
    await expect(useCase.execute(pieceId)).resolves.not.toThrow();

    expect(annotations.deleteByPieceId).toHaveBeenCalledWith(pieceId);
    expect(snapshots.deleteByPieceId).toHaveBeenCalledWith(pieceId);
    expect(pieces.delete).toHaveBeenCalledWith(pieceId);
  });
});
