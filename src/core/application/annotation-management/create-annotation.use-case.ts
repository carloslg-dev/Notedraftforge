import type {
  Annotation,
  AnnotationContent,
  AnnotationKind,
  AnnotationTarget,
  Piece,
  TextRangeTarget
} from '../../domain/types/index';
import { createAnnotation } from '../../domain/factories/annotation';
import type { PieceRepository, AnnotationRepository } from '../../ports';

export interface CreateAnnotationUseCaseInput {
  pieceId: string;
  target: AnnotationTarget;
  kind: AnnotationKind;
  content: AnnotationContent;
}

function validateTargetAgainstPiece(target: AnnotationTarget, piece: Piece): void {
  if (piece.content.kind !== 'text' && piece.content.kind !== 'poem') {
    return;
  }

  if (target.kind === 'text-range') {
    const textTarget = target as TextRangeTarget;
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
  } else if (target.kind === 'text-node') {
    const exists = piece.content.blocks.some(b => b.id === target.blockId);
    if (!exists) {
      throw new Error(`Target block not found in piece: ${target.blockId}`);
    }
  }
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

    validateTargetAgainstPiece(input.target, piece);

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
