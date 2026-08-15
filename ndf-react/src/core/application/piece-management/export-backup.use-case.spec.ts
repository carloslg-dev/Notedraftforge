import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest';
import { ExportBackupUseCase } from './export-backup.use-case';
import type { PieceRepository, AnnotationRepository, SnapshotRepository } from '../../ports';
import type { Piece, Annotation, PieceSnapshot, LayerKind } from '../../domain/types/';

describe('ExportBackupUseCase', () => {
  let pieceRepository: Mocked<PieceRepository>;
  let annotationRepository: Mocked<AnnotationRepository>;
  let snapshotRepository: Mocked<SnapshotRepository>;
  let useCase: ExportBackupUseCase;

  beforeEach(() => {
    pieceRepository = {
      getAll: vi.fn(),
      getById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    } as Mocked<PieceRepository>;

    annotationRepository = {
      getByPieceId: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
      deleteByPieceId: vi.fn(),
    } as Mocked<AnnotationRepository>;

    snapshotRepository = {
      getByPieceId: vi.fn(),
      save: vi.fn(),
      deleteByPieceId: vi.fn(),
    } as Mocked<SnapshotRepository>;

    useCase = new ExportBackupUseCase(
      pieceRepository,
      annotationRepository,
      snapshotRepository
    );
  });

  it('exports all pieces, annotations, and layerVisibility in JSON format', async () => {
    const mockPiece: Piece = {
      id: '123',
      title: 'Test Piece',
      type: 'text',
      content: { kind: 'text', blocks: [] },
      language: 'en',
      tags: [{ kind: 'type', value: 'text' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 1,
    };

    const mockAnnotation: Annotation = {
      id: 'a1',
      pieceId: '123',
      target: { kind: 'text-range', blockId: 'b1', startOffset: 0, endOffset: 5 },
      kind: 'breath',
      content: { mark: 'S' },
      layerId: 'breath',
      status: 'valid',
    };

    const mockLayerVisibility: Record<LayerKind, boolean> = {
      chord: true,
      meter: false,
      breath: true,
      intention: true,
      comments: false,
    };

    const mockSnapshot: PieceSnapshot = {
      pieceId: '123',
      html: '<p>HTML</p>',
      layerVisibility: mockLayerVisibility,
      sourceRevision: 1,
      generatedAt: new Date().toISOString(),
    };

    pieceRepository.getAll.mockResolvedValue([mockPiece]);
    annotationRepository.getByPieceId.mockResolvedValue([mockAnnotation]);
    snapshotRepository.getByPieceId.mockResolvedValue(mockSnapshot);

    const result = await useCase.execute();

    expect(pieceRepository.getAll).toHaveBeenCalled();
    expect(annotationRepository.getByPieceId).toHaveBeenCalledWith('123');
    expect(snapshotRepository.getByPieceId).toHaveBeenCalledWith('123');

    // Filename pattern matching
    expect(result.filename).toMatch(/^notedraftforge-backup-\d{4}-\d{2}-\d{2}\.json$/);

    const parsedData = JSON.parse(result.content);
    expect(parsedData.version).toBe('1');
    expect(parsedData.exportedAt).toBeDefined();
    expect(parsedData.pieces).toHaveLength(1);

    const exportedPiece = parsedData.pieces[0];
    expect(exportedPiece.id).toBe(mockPiece.id);
    expect(exportedPiece.annotations).toEqual([mockAnnotation]);
    expect(exportedPiece.layerVisibility).toEqual(mockLayerVisibility);
  });

  it('provides default layer visibility if snapshot is missing', async () => {
    const mockPiece: Piece = {
      id: '456',
      title: 'No Snapshot',
      type: 'text',
      content: { kind: 'text', blocks: [] },
      language: 'en',
      tags: [{ kind: 'type', value: 'text' }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 1,
    };

    pieceRepository.getAll.mockResolvedValue([mockPiece]);
    annotationRepository.getByPieceId.mockResolvedValue([]);
    snapshotRepository.getByPieceId.mockResolvedValue(null);

    const result = await useCase.execute();
    const parsedData = JSON.parse(result.content);
    const exportedPiece = parsedData.pieces[0];

    const defaultLayerVisibility: Record<LayerKind, boolean> = {
      chord: true,
      meter: false,
      breath: false,
      intention: false,
      comments: false,
    };

    expect(exportedPiece.layerVisibility).toEqual(defaultLayerVisibility);
  });
});
