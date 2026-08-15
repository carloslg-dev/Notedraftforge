import { AnnotationRepository, PieceRepository, SnapshotRepository } from '../../ports';

export class DeletePieceUseCase {
  constructor(
    private readonly pieces: PieceRepository,
    private readonly annotations: AnnotationRepository,
    private readonly snapshots: SnapshotRepository
  ) {}

  async execute(pieceId: string): Promise<void> {
    await this.annotations.deleteByPieceId(pieceId);
    await this.snapshots.deleteByPieceId(pieceId);
    await this.pieces.delete(pieceId);
  }
}
