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

export function parseYamlFrontmatter(rawContent: string): { metadata: FrontmatterMetadata; body: string } {
  const normalized = rawContent.replace(/\r\n/g, '\n');
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = normalized.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, body: normalized };
  }

  const yamlBlock = match[1];
  const body = match[2];
  const metadata: FrontmatterMetadata = {};

  const lines = yamlBlock.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let valStr = trimmed.slice(colonIdx + 1).trim();

    if ((valStr.startsWith('"') && valStr.endsWith('"')) || (valStr.startsWith("'") && valStr.endsWith("'"))) {
      valStr = valStr.slice(1, -1);
    }

    if (key === 'id') metadata.id = valStr;
    else if (key === 'title') metadata.title = valStr;
    else if (key === 'type' && (valStr === 'text' || valStr === 'poem' || valStr === 'song')) metadata.type = valStr;
    else if (key === 'language') metadata.language = valStr;
    else if (key === 'revision') metadata.revision = parseInt(valStr, 10) || 0;
    else if (key === 'createdAt') metadata.createdAt = valStr;
    else if (key === 'updatedAt') metadata.updatedAt = valStr;
    else if (key === 'tags') {
      if (valStr.startsWith('[') && valStr.endsWith(']')) {
        const rawTags = valStr
          .slice(1, -1)
          .split(',')
          .map(t => t.trim().replace(/^["']|["']$/g, ''))
          .filter(Boolean);
        metadata.tags = rawTags;
      }
    }
  }

  return { metadata, body };
}

export function parseYamlMarkdownToPiece(rawContent: string, fallbackTitle = 'Untitled Work'): Piece {
  const { metadata, body } = parseYamlFrontmatter(rawContent);
  const parser = new MarkedParserAdapter();
  const blocks = parser.parse(body);

  const pieceType = metadata.type || 'poem';
  const title = metadata.title || fallbackTitle;
  const piece = createPiece({
    title,
    type: pieceType,
    language: metadata.language || 'es'
  });

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

  const frontmatterLines = [
    '---',
    `id: "${piece.id}"`,
    `title: "${piece.title.replace(/"/g, '\\"')}"`,
    `type: "${piece.type}"`,
    `language: "${piece.language}"`,
    `revision: ${piece.revision}`,
    `tags: [${userTags.map((t: string) => `"${t}"`).join(', ')}]`,
    `createdAt: "${piece.createdAt}"`,
    `updatedAt: "${piece.updatedAt}"`,
    '---',
    ''
  ];

  const body = exportPieceToMarkdown(piece);
  return frontmatterLines.join('\n') + body;
}
