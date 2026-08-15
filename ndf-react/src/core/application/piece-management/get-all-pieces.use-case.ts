import { Piece } from '../../domain/types/';
import { PieceRepository } from '../../ports';

export class GetAllPiecesUseCase {
  constructor(private readonly pieces: PieceRepository) {}

  async execute(): Promise<Piece[]> {
    const allPieces = await this.pieces.getAll();

    // WL-REQ-08: Song type hidden from MVP list
    const visiblePieces = allPieces.filter(piece => piece.type !== 'song');

    // WL-REQ-01: Default sorting SHALL be updatedAt descending (most recently updated first)
    return visiblePieces.sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      return dateB - dateA;
    });
  }
}
