import { Piece } from '../../domain/types/';
import { createPiece } from '../../domain/factories';
import { PieceRepository } from '../../ports';

export interface CreatePieceCommand {
  title: string;
  type: 'text' | 'poem';
  language: string;
}

export class CreatePieceUseCase {
  constructor(private readonly pieces: PieceRepository) {}

  async execute(input: CreatePieceCommand): Promise<Piece> {
    const piece = createPiece({
      title: input.title,
      type: input.type,
      language: input.language
    });

    await this.pieces.save(piece);

    return piece;
  }
}
