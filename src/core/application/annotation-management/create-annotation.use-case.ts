import type {
  Annotation,
  AnnotationContent,
  AnnotationTarget,
  TextRangeTarget
} from '../../domain/types/index';
import type { AnnotationKind } from '../../domain/types/index';
import { createAnnotation } from '../../domain/factories/annotation';
import type { PieceRepository, AnnotationRepository } from '../../ports';

export interface CreateAnnotationUseCaseInput {
  pieceId: string;
  target: AnnotationTarget;
  kind: AnnotationKind;
  content: AnnotationContent;
}

export class CreateAnnotationUseCase {
  constructor(
    private readonly pieceRepository: PieceRepository,
    private readonly annotationRepository: AnnotationRepository
  ) {}

  async execute(input: CreateAnnotationUseCaseInput): Promise<Annotation> {
    if (!input.pieceId || input.pieceId.trim() === '') {
      throw new Error('pieceId cannot be empty');
    }

    const piece = await this.pieceRepository.getById(input.pieceId);
    if (!piece) {
      throw new Error(`Piece not found: ${input.pieceId}`);
    }

    // Validate target existence & bounds against piece content
    if (input.target.kind === 'text-range') {
      const textTarget = input.target as TextRangeTarget;
      if (piece.content.kind === 'text' || piece.content.kind === 'poem') {
        const block = piece.content.blocks.find(b => b.id === textTarget.blockId);
        if (!block) {
          throw new Error(`Target block not found in piece: ${textTarget.blockId}`);
        }
        const totalTextLength = block.runs.reduce((acc, run) => acc + run.text.length, 0);
        if (textTarget.startOffset < 0 || textTarget.endOffset < textTarget.startOffset) {
          throw new Error(`Invalid text range bounds: startOffset=${textTarget.startOffset}, endOffset=${textTarget.endOffset}`);
        }
        if (textTarget.endOffset > totalTextLength) {
          throw new Error(`End offset ${textTarget.endOffset} exceeds block text length ${totalTextLength}`);
        }
      }
    } else if (input.target.kind === 'text-node') {
      const textNodeTarget = input.target;
      if (piece.content.kind === 'text' || piece.content.kind === 'poem') {
        const block = piece.content.blocks.find(b => b.id === textNodeTarget.blockId);
        if (!block) {
          throw new Error(`Target block not found in piece: ${textNodeTarget.blockId}`);
        }
      }
    }

    // Create domain entity
    const annotation = createAnnotation({
      pieceId: input.pieceId,
      target: input.target,
      kind: input.kind,
      content: input.content
    });

    // Update piece metadata (revision & updatedAt)
    const updatedPiece = {
      ...piece,
      revision: piece.revision + 1,
      updatedAt: new Date().toISOString()
    };

    await this.pieceRepository.save(updatedPiece);
    await this.annotationRepository.save(annotation);

    return annotation;
  }
}
