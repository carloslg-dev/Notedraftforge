import type { AnnotationRepository, PieceRepository, SnapshotRepository } from '../../ports';
import type { Annotation, LayerKind, Piece } from '../../domain/types/';

export interface BackupData {
  version: string;
  exportedAt: string;
  pieces: Array<
    Piece & {
      annotations: Annotation[];
      layerVisibility: Record<LayerKind, boolean>;
    }
  >;
}

export interface ExportBackupResult {
  filename: string;
  content: string;
}

export class ExportBackupUseCase {
  constructor(
    private readonly pieceRepository: PieceRepository,
    private readonly annotationRepository: AnnotationRepository,
    private readonly snapshotRepository: SnapshotRepository
  ) {}

  async execute(): Promise<ExportBackupResult> {
    const pieces = await this.pieceRepository.getAll();
    const backupData: BackupData = {
      version: '1',
      exportedAt: new Date().toISOString(),
      pieces: [],
    };

    const defaultLayerVisibility: Record<LayerKind, boolean> = {
      chord: true,
      meter: false,
      breath: false,
      intention: false,
      comments: false,
    };

    for (const piece of pieces) {
      const annotations = await this.annotationRepository.getByPieceId(piece.id);
      const snapshot = await this.snapshotRepository.getByPieceId(piece.id);

      backupData.pieces.push({
        ...piece,
        annotations,
        layerVisibility: snapshot ? snapshot.layerVisibility : { ...defaultLayerVisibility },
      });
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `notedraftforge-backup-${dateStr}.json`;
    const content = JSON.stringify(backupData, null, 2);

    return { filename, content };
  }
}
