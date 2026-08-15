import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RestoreBackupUseCase } from './restore-backup.use-case';
import type { BackupValidatorPort, SystemRestorePort } from '../../ports';
import type { Piece, Annotation, PieceSnapshot, LayerKind } from '../../domain/types/';
import type { BackupData } from './export-backup.use-case';

describe('RestoreBackupUseCase', () => {
  let mockValidator: BackupValidatorPort;
  let mockSystemRestore: SystemRestorePort;
  let useCase: RestoreBackupUseCase;

  const mockUUIDPiece = 'a0123456-7890-abcd-ef01-234567890abc';
  const mockUUIDAnn = 'd0123456-7890-abcd-ef01-234567890abc';

  const defaultLayerVisibility: Record<LayerKind, boolean> = {
    chord: true,
    meter: false,
    breath: false,
    intention: false,
    comments: false,
  };

  const mockPiece: Piece = {
    id: mockUUIDPiece,
    title: 'Song Title',
    type: 'text',
    content: { kind: 'text', blocks: [] },
    language: 'en',
    tags: [{ kind: 'type', value: 'text' }],
    createdAt: '2026-07-22T12:00:00Z',
    updatedAt: '2026-07-22T12:00:00Z',
    revision: 2,
  };

  const mockAnnotation: Annotation = {
    id: mockUUIDAnn,
    pieceId: mockUUIDPiece,
    target: { kind: 'text-node', blockId: 'some-block' },
    kind: 'comment',
    content: { shortNote: 'note' },
    layerId: 'comments',
    status: 'valid',
  };

  const mockBackupData: BackupData = {
    version: '1',
    exportedAt: '2026-07-22T12:00:00Z',
    pieces: [
      {
        ...mockPiece,
        annotations: [mockAnnotation],
        layerVisibility: defaultLayerVisibility,
      },
    ],
  };

  beforeEach(() => {
    mockValidator = {
      validate: vi.fn().mockReturnValue(mockBackupData),
    };
    mockSystemRestore = {
      replaceAllData: vi.fn().mockResolvedValue(undefined),
    };
    useCase = new RestoreBackupUseCase(mockValidator, mockSystemRestore);
  });

  it('orchestrates validation and mapping correctly', async () => {
    const jsonString = '{ "dummy": "json" }';

    await useCase.execute(jsonString);

    expect(mockValidator.validate).toHaveBeenCalledWith(jsonString);
    expect(mockSystemRestore.replaceAllData).toHaveBeenCalledTimes(1);

    const callArgs = vi.mocked(mockSystemRestore.replaceAllData).mock.calls[0];
    const piecesArg = callArgs[0] as Piece[];
    const annotationsArg = callArgs[1] as Annotation[];
    const snapshotsArg = callArgs[2] as PieceSnapshot[];

    // Verify Piece mapping
    expect(piecesArg).toHaveLength(1);
    expect(piecesArg[0]).toEqual(mockPiece);

    // Verify Annotations mapping
    expect(annotationsArg).toHaveLength(1);
    expect(annotationsArg[0]).toEqual(mockAnnotation);

    // Verify Snapshot mapping
    expect(snapshotsArg).toHaveLength(1);
    expect(snapshotsArg[0].pieceId).toBe(mockUUIDPiece);
    expect(snapshotsArg[0].layerVisibility).toEqual(defaultLayerVisibility);
    expect(snapshotsArg[0].sourceRevision).toBe(2);
    expect(snapshotsArg[0].html).toBe('');
    expect(snapshotsArg[0].generatedAt).toBeDefined();
  });

  it('bubbles up errors if validator throws', async () => {
    mockValidator.validate = vi.fn().mockImplementation(() => {
      throw new Error('Validation failed');
    });

    await expect(useCase.execute('invalid json')).rejects.toThrow('Validation failed');
    expect(mockSystemRestore.replaceAllData).not.toHaveBeenCalled();
  });

  it('bubbles up errors if persistence fails', async () => {
    mockSystemRestore.replaceAllData = vi.fn().mockRejectedValue(new Error('IndexedDB write error'));

    await expect(useCase.execute('{}')).rejects.toThrow('IndexedDB write error');
  });
});
