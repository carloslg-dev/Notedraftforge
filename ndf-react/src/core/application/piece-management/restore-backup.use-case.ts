import type { BackupValidatorPort, SystemRestorePort } from '../../ports';
import type { Piece, Annotation, PieceSnapshot } from '../../domain/types/';

export class RestoreBackupUseCase {
  constructor(
    private readonly validator: BackupValidatorPort,
    private readonly systemRestore: SystemRestorePort
  ) {}

  async execute(jsonString: string): Promise<void> {
    // 1. Validate and parse the backup JSON
    const backupData = this.validator.validate(jsonString);

    const pieces: Piece[] = [];
    const annotations: Annotation[] = [];
    const snapshots: PieceSnapshot[] = [];

    const now = new Date().toISOString();

    // 2. Extract and map entities
    for (const backupPiece of backupData.pieces) {
      // Extract Piece domain entity fields
      const piece: Piece = {
        id: backupPiece.id,
        title: backupPiece.title,
        type: backupPiece.type,
        content: backupPiece.content,
        language: backupPiece.language,
        tags: backupPiece.tags,
        createdAt: backupPiece.createdAt,
        updatedAt: backupPiece.updatedAt,
        revision: backupPiece.revision,
      };
      pieces.push(piece);

      // Collect all annotations for this piece
      if (backupPiece.annotations) {
        annotations.push(...backupPiece.annotations);
      }

      // Reconstruct PieceSnapshot for this piece with restored layer visibility
      const snapshot: PieceSnapshot = {
        pieceId: backupPiece.id,
        html: '', // Empty html shell, will be regenerated on demand/background
        layerVisibility: backupPiece.layerVisibility,
        sourceRevision: backupPiece.revision,
        generatedAt: now,
      };
      snapshots.push(snapshot);
    }

    // 3. Atomically replace the system state
    await this.systemRestore.replaceAllData(pieces, annotations, snapshots);
  }
}
