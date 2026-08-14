import { Annotation, AnnotationContent, AnnotationTarget, BreathContent, NoteAnnotationContent } from '../types/annotation';
import { AnnotationKind, LayerKind } from '../types/layer';
import { randomUUID } from '../uuid';

export interface CreateAnnotationInput {
  pieceId: string;
  target: AnnotationTarget;
  kind: AnnotationKind;
  content: AnnotationContent;
}

function deriveLayerId(kind: AnnotationKind): LayerKind {
  switch (kind) {
    case 'breath':
      return 'breath';
    case 'intent':
      return 'intention';
    case 'comment':
      return 'comments';
    default:
      // Runtime fallback just in case
      throw new Error(`Unsupported annotation kind: ${kind as string}`);
  }
}

function validateAnnotationContent(kind: AnnotationKind, content: AnnotationContent): AnnotationContent {
  if (kind === 'breath') {
    const breathContent = content as BreathContent;
    if (breathContent.mark !== 'S' && breathContent.mark !== 'L') {
      throw new Error("Breath annotation mark must be 'S' or 'L'");
    }
    return breathContent;
  } else if (kind === 'intent' || kind === 'comment') {
    const noteContent = content as NoteAnnotationContent;
    if (!noteContent.shortNote || noteContent.shortNote.trim() === '') {
      throw new Error("shortNote must be a non-empty string");
    }
    if (noteContent.extendedNote?.trim() === '') {
      throw new Error("extendedNote must be a non-empty string when present");
    }
    const sanitized: NoteAnnotationContent = {
      shortNote: noteContent.shortNote.trim(),
    };
    if (noteContent.extendedNote !== undefined) {
      sanitized.extendedNote = noteContent.extendedNote.trim();
    }
    return sanitized;
  }
  throw new Error(`Invalid kind: ${kind}`);
}

export function createAnnotation(input: CreateAnnotationInput): Annotation {
  if (!input.pieceId || input.pieceId.trim() === '') {
    throw new Error('pieceId cannot be empty');
  }

  if (!input.target) {
    throw new Error('target is required');
  }

  const validTargetKinds = ['text-range', 'text-node', 'song-cell', 'song-cell-range'];
  if (!input.target.kind || !validTargetKinds.includes(input.target.kind)) {
    throw new Error(`Invalid target kind. Must be one of: ${validTargetKinds.join(', ')}`);
  }

  const sanitizedContent = validateAnnotationContent(input.kind, input.content);

  const layerId = deriveLayerId(input.kind);

  return {
    id: randomUUID(),
    pieceId: input.pieceId,
    target: input.target,
    kind: input.kind,
    content: sanitizedContent,
    layerId,
    status: 'valid',
  };
}

export function markAnnotationNeedsReview(annotation: Annotation): Annotation {
  return {
    ...annotation,
    status: 'needsReview',
  };
}
