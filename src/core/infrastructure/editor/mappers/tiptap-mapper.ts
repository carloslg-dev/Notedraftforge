import type { PieceContent, TextBlock, TextRun, TextMark, TextPieceContent, PoemPieceContent } from '../../../domain/types/';
import type { JSONContent } from '@tiptap/core';
import { randomUUID } from '../../../domain/uuid';

export function domainToTiptap(content: PieceContent): JSONContent {
  if (content.kind === 'song') {
    throw new Error('Song content is not supported for editing yet.');
  }

  const tiptapContent: JSONContent[] = content.blocks.map(blockToTiptap);

  return {
    type: 'doc',
    content: tiptapContent,
  };
}

function blockToTiptap(block: TextBlock): JSONContent {
  let type = 'paragraph';
  if (block.kind === 'heading') type = 'heading';
  else if (block.kind === 'quote') type = 'blockquote';

  return {
    type,
    attrs: {
      id: block.id,
      ...(block.kind === 'heading' ? { level: 1 } : {}), // Simplified for MVP
    },
    content: block.runs.map(runToTiptap),
  };
}

function runToTiptap(run: TextRun): JSONContent {
  const marks = run.marks?.map(mark => ({ type: mark }));

  return {
    type: 'text',
    text: run.text,
    ...(marks && marks.length > 0 ? { marks } : {}),
  };
}

export function tiptapToDomain(
  tiptapJson: JSONContent,
  originalKind: 'text' | 'poem'
): TextPieceContent | PoemPieceContent {
  if (tiptapJson.type !== 'doc' || !Array.isArray(tiptapJson.content)) {
    return {
      kind: originalKind,
      blocks: [],
    };
  }

  const blocks: TextBlock[] = tiptapJson.content.map(tiptapToBlock).filter((b): b is TextBlock => b !== null);

  return {
    kind: originalKind,
    blocks,
  };
}

function extractMarks(childMarks: Array<{ type: string }> | undefined): TextMark[] {
  const marks: TextMark[] = [];
  if (childMarks) {
    for (const m of childMarks) {
      if (m.type === 'bold' || m.type === 'italic' || m.type === 'underline') {
        marks.push(m.type as TextMark);
      }
    }
  }
  return marks;
}

function extractRuns(content: JSONContent[] | undefined): TextRun[] {
  const runs: TextRun[] = [];
  if (!content || !Array.isArray(content)) {
    return runs;
  }

  for (const child of content) {
    if (child.type === 'text' && child.text) {
      const marks = extractMarks(child.marks);
      runs.push({
        id: randomUUID(),
        text: child.text,
        ...(marks.length > 0 ? { marks } : {}),
      });
    } else if (child.type === 'hardBreak') {
      runs.push({
        id: randomUUID(),
        text: '\n',
      });
    }
  }
  return runs;
}

function resolveBlockId(rawId: unknown): string {
  let blockId = rawId;
  if (typeof blockId === 'function') {
    blockId = (blockId as () => string)();
  }
  if (!blockId || typeof blockId !== 'string') {
    return randomUUID();
  }
  return blockId;
}

function tiptapToBlock(node: JSONContent): TextBlock | null {
  let kind: TextBlock['kind'] = 'paragraph';
  if (node.type === 'heading') {
    kind = 'heading';
  } else if (node.type === 'blockquote') {
    kind = 'quote';
  }

  const runs = extractRuns(node.content);
  const id = resolveBlockId(node.attrs?.id);

  return {
    id,
    kind,
    runs,
  };
}

