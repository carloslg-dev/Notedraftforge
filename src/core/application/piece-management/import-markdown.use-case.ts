import type { Piece } from '../../domain/types/index';
import { createPiece } from '../../domain/factories';
import type { PieceRepository, MarkdownParserPort } from '../../ports/index';

export interface ImportMarkdownCommand {
  title: string;
  markdown: string;
  language: string;
}

export class ImportMarkdownUseCase {
  constructor(
    private readonly pieces: PieceRepository,
    private readonly markdownParser: MarkdownParserPort
  ) {}

  async execute(input: ImportMarkdownCommand): Promise<Piece> {
    const blocks = this.markdownParser.parse(input.markdown);

    const piece = createPiece({
      title: input.title,
      type: 'text',
      language: input.language
    });

    const importedPiece: Piece = {
      ...piece,
      content: {
        kind: 'text',
        blocks
      }
    };

    await this.pieces.save(importedPiece);

    return importedPiece;
  }
}
