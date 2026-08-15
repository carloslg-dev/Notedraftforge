import type { PieceRepository, AnnotationRepository } from '../../ports';

export class DeleteAnnotationUseCase {
  constructor(
    private readonly pieceRepository: PieceRepository,
    private readonly annotationRepository: AnnotationRepository
  ) {}

  async execute(annotationId: string, pieceId: string): Promise<void> {
    const piece = await this.pieceRepository.getById(pieceId);
    if (piece) {
      const updatedPiece = {
        ...piece,
        revision: piece.revision + 1,
        updatedAt: new Date().toISOString()
      };
      await this.pieceRepository.save(updatedPiece);
    }
    await this.annotationRepository.delete(annotationId);
  }
}
