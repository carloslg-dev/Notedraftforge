import { Piece } from '../../domain/types/';
import { updatePieceMetadata } from '../../domain/factories';
import { PieceRepository } from '../../ports';

export interface UpdatePieceMetadataCommand {
  pieceId: string;
  title?: string;
  language?: string;
  tags?: string[];
}

export class UpdatePieceMetadataUseCase {
  constructor(private readonly pieces: PieceRepository) {}

  async execute(input: UpdatePieceMetadataCommand): Promise<Piece> {
    const piece = await this.pieces.getById(input.pieceId);

    if (!piece) {
      throw new Error(`Piece with id ${input.pieceId} not found`);
    }

    const updatedPiece = updatePieceMetadata(piece, {
      title: input.title,
      language: input.language,
      tags: input.tags,
    });

    await this.pieces.save(updatedPiece);

    return updatedPiece;
  }
}
