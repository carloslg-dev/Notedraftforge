import { Piece, TextBlock, TextRun, TextMark, TagRef } from '../../domain/types/index';

export function exportPieceToMarkdown(piece: Piece, options?: { includeFrontmatter?: boolean }): string {
  if (piece.type === 'song') {
    throw new Error('Song export not supported');
  }

  const content = piece.content;
  if (content.kind !== 'text' && content.kind !== 'poem') {
    throw new Error(`Unsupported piece kind: ${content.kind}`);
  }

  const blocksMd = content.blocks.map(block => blockToMarkdown(block));
  const bodyMd = blocksMd.join('\n\n');

  if (options?.includeFrontmatter) {
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
    return frontmatterLines.join('\n') + bodyMd;
  }

  return bodyMd;
}

function blockToMarkdown(block: TextBlock): string {
  const text = block.runs.map(run => runToMarkdown(run)).join('');

  switch (block.kind) {
    case 'heading':
      return `# ${text}`;
    case 'quote':
      return `> ${text}`;
    case 'paragraph':
    case 'line':
      return text;
    default:
      return text;
  }
}

function runToMarkdown(run: TextRun): string {
  if (!run.marks || run.marks.length === 0) {
    return run.text;
  }

  let result = run.text;
  // Apply marks. Order of wrapping doesn't matter much for Markdown, but we must be consistent.
  // We apply them in order: underline, italic, bold (so bold is outermost)
  const hasMark = (mark: TextMark) => run.marks?.includes(mark);

  if (hasMark('underline')) {
    result = `<u>${result}</u>`;
  }
  if (hasMark('italic')) {
    result = `*${result}*`;
  }
  if (hasMark('bold')) {
    result = `**${result}**`;
  }

  return result;
}
