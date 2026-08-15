import { Piece } from '../../domain/types/';
import { PieceRepository } from '../../ports';

export class GetPieceUseCase {
  constructor(private readonly pieces: PieceRepository) {}

  async execute(id: string): Promise<Piece | null> {
    return this.pieces.getById(id);
  }
}
