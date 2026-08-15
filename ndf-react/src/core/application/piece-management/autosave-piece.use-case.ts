import { Piece, PieceContent } from '../../domain/types/';
import { updatePieceContent } from '../../domain/factories';
import { PieceRepository } from '../../ports';

export interface AutosavePieceCommand {
  pieceId: string;
  content: PieceContent;
}

export class AutosavePieceUseCase {
  constructor(private readonly pieces: PieceRepository) {}

  async execute(input: AutosavePieceCommand): Promise<Piece> {
    const piece = await this.pieces.getById(input.pieceId);
    if (!piece) {
      throw new Error(`Piece not found: ${input.pieceId}`);
    }

    const updatedPiece = updatePieceContent(piece, input.content);
    await this.pieces.save(updatedPiece);

    return updatedPiece;
  }
}
