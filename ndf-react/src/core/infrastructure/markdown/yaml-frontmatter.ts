import { createPiece } from '../../domain/factories/piece';
import type { Piece, TagRef } from '../../domain/types/index';
import { exportPieceToMarkdown } from '../markdown-export/exportPieceToMarkdown';
import { MarkedParserAdapter } from '../markdown-parser/marked-parser.adapter';

export interface FrontmatterMetadata {
  id?: string;
  title?: string;
  type?: 'text' | 'poem' | 'song';
  language?: string;
  revision?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
const VALID_PIECE_TYPES = new Set<NonNullable<FrontmatterMetadata['type']>>(['text', 'poem', 'song']);

function unquote(val: string): string {
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

function parseTags(valStr: string): string[] | undefined {
  if (!valStr.startsWith('[') || !valStr.endsWith(']')) {
    return undefined;
  }
  return valStr
    .slice(1, -1)
    .split(',')
    .map(t => unquote(t.trim()))
    .filter(Boolean);
}

function parseField(key: string, valStr: string, metadata: FrontmatterMetadata): void {
  const value = unquote(valStr);

  switch (key) {
    case 'id':
      metadata.id = value;
      break;
    case 'title':
      metadata.title = value;
      break;
    case 'type':
      if (VALID_PIECE_TYPES.has(value as NonNullable<FrontmatterMetadata['type']>)) {
        metadata.type = value as NonNullable<FrontmatterMetadata['type']>;
      }
      break;
    case 'language':
      metadata.language = value;
      break;
    case 'revision': {
      const parsedRev = Number.parseInt(value, 10);
      metadata.revision = Number.isNaN(parsedRev) ? 0 : parsedRev;
      break;
    }
    case 'createdAt':
      metadata.createdAt = value;
      break;
    case 'updatedAt':
      metadata.updatedAt = value;
      break;
    case 'tags': {
      const tags = parseTags(valStr);
      if (tags) {
        metadata.tags = tags;
      }
      break;
    }
  }
}

function parseLine(line: string, metadata: FrontmatterMetadata): void {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;

  const colonIdx = trimmed.indexOf(':');
  if (colonIdx === -1) return;

  const key = trimmed.slice(0, colonIdx).trim();
  const valStr = trimmed.slice(colonIdx + 1).trim();

  parseField(key, valStr, metadata);
}

export function parseYamlFrontmatter(rawContent: string): { metadata: FrontmatterMetadata; body: string } {
  const normalized = rawContent.replace(/\r\n/g, '\n');
  const match = FRONTMATTER_REGEX.exec(normalized);

  if (!match) {
    return { metadata: {}, body: normalized };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const metadata: FrontmatterMetadata = {};

  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    parseLine(line, metadata);
  }

  return { metadata, body };
}

function applyMetadataToPiece(piece: Piece, metadata: FrontmatterMetadata, pieceType: 'text' | 'poem' | 'song'): void {
  if (metadata.id) {
    piece.id = metadata.id;
  }
  if (typeof metadata.revision === 'number') {
    piece.revision = metadata.revision;
  }
  if (metadata.createdAt) {
    piece.createdAt = metadata.createdAt;
  }
  if (metadata.updatedAt) {
    piece.updatedAt = metadata.updatedAt;
  }

  if (metadata.tags && metadata.tags.length > 0) {
    const userTags: TagRef[] = metadata.tags.map(val => ({ kind: 'user', value: val }));
    const typeTag: TagRef = { kind: 'type', value: pieceType };
    piece.tags = [typeTag, ...userTags];
  }
}

export function parseYamlMarkdownToPiece(rawContent: string, fallbackTitle = 'Untitled Work'): Piece {
  const { metadata, body } = parseYamlFrontmatter(rawContent);
  const parser = new MarkedParserAdapter();
  const blocks = parser.parse(body);

  const pieceType = metadata.type ?? 'poem';
  const title = metadata.title ?? fallbackTitle;
  const piece = createPiece({
    title,
    type: pieceType,
    language: metadata.language ?? 'es'
  });

  applyMetadataToPiece(piece, metadata, pieceType);

  if (pieceType === 'text' || pieceType === 'poem') {
    piece.content = {
      kind: pieceType,
      blocks
    };
  }

  return piece;
}

export function serializePieceToYamlMarkdown(piece: Piece): string {
  const userTags = piece.tags
    .filter((t: TagRef) => t.kind === 'user')
    .map((t: TagRef) => t.value);

  const escapedTitle = piece.title.replace(/"/g, String.raw`\"`);
  const formattedTags = userTags.map((t: string) => JSON.stringify(t)).join(', ');

  const frontmatterLines = [
    '---',
    `id: "${piece.id}"`,
    `title: "${escapedTitle}"`,
    `type: "${piece.type}"`,
    `language: "${piece.language}"`,
    `revision: ${piece.revision}`,
    `tags: [${formattedTags}]`,
    `createdAt: "${piece.createdAt}"`,
    `updatedAt: "${piece.updatedAt}"`,
    '---',
    ''
  ];

  const body = exportPieceToMarkdown(piece);
  return frontmatterLines.join('\n') + body;
}
