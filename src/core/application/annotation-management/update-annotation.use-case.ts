import type {
  Annotation,
  AnnotationContent,
  AnnotationTarget,
  TextRangeTarget,
  BreathContent,
  NoteAnnotationContent
} from '../../domain/types/index';
import type { PieceRepository, AnnotationRepository } from '../../ports';

export interface UpdateAnnotationUseCaseInput {
  annotationId: string;
  pieceId: string;
  content: AnnotationContent;
  target?: AnnotationTarget;
}

export class UpdateAnnotationUseCase {
  constructor(
    private readonly pieceRepository: PieceRepository,
    private readonly annotationRepository: AnnotationRepository
  ) {}

  async execute(input: UpdateAnnotationUseCaseInput): Promise<Annotation> {
    if (!input.annotationId || input.annotationId.trim() === '') {
      throw new Error('annotationId cannot be empty');
    }
    if (!input.pieceId || input.pieceId.trim() === '') {
      throw new Error('pieceId cannot be empty');
    }

    const piece = await this.pieceRepository.getById(input.pieceId);
    if (!piece) {
      throw new Error(`Piece not found: ${input.pieceId}`);
    }

    const pieceAnnotations = await this.annotationRepository.getByPieceId(input.pieceId);
    const existingAnnotation = pieceAnnotations.find(a => a.id === input.annotationId);
    if (!existingAnnotation) {
      throw new Error(`Annotation not found: ${input.annotationId}`);
    }

    const targetToValidate = input.target || existingAnnotation.target;

    // Validate target existence & bounds against piece content
    if (targetToValidate.kind === 'text-range') {
      const textTarget = targetToValidate as TextRangeTarget;
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
    } else if (targetToValidate.kind === 'text-node') {
      const textNodeTarget = targetToValidate;
      if (piece.content.kind === 'text' || piece.content.kind === 'poem') {
        const block = piece.content.blocks.find(b => b.id === textNodeTarget.blockId);
        if (!block) {
          throw new Error(`Target block not found in piece: ${textNodeTarget.blockId}`);
        }
      }
    }

    // Validate content based on existing annotation kind
    if (existingAnnotation.kind === 'breath') {
      const breathContent = input.content as BreathContent;
      if (!breathContent || (breathContent.mark !== 'S' && breathContent.mark !== 'L')) {
        throw new Error("Breath mark must be 'S' or 'L'");
      }
    } else {
      const noteContent = input.content as NoteAnnotationContent;
      if (!noteContent || !noteContent.shortNote || noteContent.shortNote.trim() === '') {
        throw new Error('shortNote cannot be empty');
      }
    }

    const updatedAnnotation: Annotation = {
      ...existingAnnotation,
      target: targetToValidate,
      content: input.content
    };

    const updatedPiece = {
      ...piece,
      revision: piece.revision + 1,
      updatedAt: new Date().toISOString()
    };

    await this.pieceRepository.save(updatedPiece);
    await this.annotationRepository.save(updatedAnnotation);

    return updatedAnnotation;
  }
}
