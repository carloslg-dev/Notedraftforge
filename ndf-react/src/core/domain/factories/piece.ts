import { Piece, PieceContent, TagRef } from '../types/piece';
import { PieceType } from '../types';
import { randomUUID } from '../uuid';

export interface CreatePieceInput {
  title: string;
  type: PieceType;
  language: string;
  tags?: string[];
}


function isValidLanguage(language: string): boolean {
  return typeof language === 'string' && language.length === 2 && /^[a-zA-Z]{2}$/.test(language);
}

export function createPiece(input: CreatePieceInput): Piece {
  if (!input.title || input.title.trim() === '') {
    throw new Error('Piece title cannot be empty');
  }
  if (!isValidLanguage(input.language)) {
    throw new Error('Language must be a valid ISO 639-1 two-letter code');
  }

  const now = new Date().toISOString();

  let content: PieceContent;
  switch (input.type) {
    case 'text':
      content = { kind: 'text', blocks: [] };
      break;
    case 'poem':
      content = { kind: 'poem', blocks: [] };
      break;
    case 'song':
      content = { kind: 'song', sections: [] };
      break;
    default:
      // Typescript should catch this, but runtime check for safety
      throw new Error(`Unsupported piece type: ${input.type as string}`);
  }

  const tags: TagRef[] = [
    { kind: 'type', value: input.type }
  ];

  if (input.tags) {
    for (const tagValue of input.tags) {
      if (tagValue.trim() !== '') {
        tags.push({ kind: 'user', value: tagValue.trim() });
      }
    }
  }

  return {
    id: randomUUID(),
    title: input.title.trim(),
    type: input.type,
    content,
    language: input.language.trim().toLowerCase(),
    tags,
    createdAt: now,
    updatedAt: now,
    revision: 0,
  };
}

export function updatePieceContent(piece: Piece, content: PieceContent): Piece {
  if (piece.type !== content.kind) {
    throw new Error(`Content kind '${content.kind}' does not match piece type '${piece.type}'`);
  }

  return {
    ...piece,
    content,
    updatedAt: new Date().toISOString(),
    revision: piece.revision + 1,
  };
}

export interface UpdatePieceMetadataInput {
  title?: string;
  language?: string;
  tags?: string[];
}

function serializeUserTags(tags: TagRef[]): string {
  return tags
    .filter(t => t.kind === 'user')
    .map(t => t.value)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
}

function resolveNewTags(currentTags: TagRef[] | undefined, pieceType: PieceType, inputTags: string[]): TagRef[] {
  const existing = currentTags || [];
  const typeTag = existing.find(tag => tag.kind === 'type') || { kind: 'type', value: pieceType };
  const newTags: TagRef[] = [typeTag];
  for (const tagValue of inputTags) {
    const trimmed = tagValue.trim();
    if (trimmed !== '') {
      newTags.push({ kind: 'user', value: trimmed });
    }
  }
  return newTags;
}

export function updatePieceMetadata(piece: Piece, input: UpdatePieceMetadataInput): Piece {
  const updates: Partial<Piece> = {};
  let hasChanges = false;

  if (input.title !== undefined) {
    const trimmedTitle = input.title.trim();
    if (trimmedTitle === '') {
      throw new Error('Piece title cannot be empty');
    }
    if (piece.title !== trimmedTitle) {
      updates.title = trimmedTitle;
      hasChanges = true;
    }
  }

  if (input.language !== undefined) {
    if (!isValidLanguage(input.language)) {
      throw new Error('Language must be a valid ISO 639-1 two-letter code');
    }
    const normalizedLang = input.language.trim().toLowerCase();
    if (piece.language !== normalizedLang) {
      updates.language = normalizedLang;
      hasChanges = true;
    }
  }

  if (input.tags !== undefined) {
    const currentTags = piece.tags || [];
    const newTags = resolveNewTags(piece.tags, piece.type, input.tags);

    if (serializeUserTags(currentTags) !== serializeUserTags(newTags)) {
      updates.tags = newTags;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    updates.updatedAt = new Date().toISOString();
  }

  return {
    ...piece,
    ...updates,
  };
}


