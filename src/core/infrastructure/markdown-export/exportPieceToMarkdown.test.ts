import { describe, it, expect } from 'vitest';
import { exportPieceToMarkdown } from './exportPieceToMarkdown';
import { Piece } from '../../domain/types/index';

describe('exportPieceToMarkdown', () => {
  it('exports a text piece with paragraphs and headings to markdown', () => {
    const piece: Piece = {
      id: 'p1',
      title: 'Test',
      type: 'text',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      tags: [],
      content: {
        kind: 'text',
        blocks: [
          {
            id: 'b1',
            kind: 'heading',
            runs: [{ id: 'r1', text: 'My Heading' }]
          },
          {
            id: 'b2',
            kind: 'paragraph',
            runs: [{ id: 'r2', text: 'This is a paragraph.' }]
          }
        ]
      }
    };

    const markdown = exportPieceToMarkdown(piece);
    expect(markdown).toBe('# My Heading\n\nThis is a paragraph.');
  });

  it('applies inline marks correctly', () => {
    const piece: Piece = {
      id: 'p1',
      title: 'Test',
      type: 'text',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      tags: [],
      content: {
        kind: 'text',
        blocks: [
          {
            id: 'b1',
            kind: 'paragraph',
            runs: [
              { id: 'r1', text: 'Normal text. ' },
              { id: 'r2', text: 'Bold text.', marks: ['bold'] },
              { id: 'r3', text: ' ' },
              { id: 'r4', text: 'Italic text.', marks: ['italic'] },
              { id: 'r5', text: ' ' },
              { id: 'r6', text: 'Underlined text.', marks: ['underline'] },
              { id: 'r7', text: ' ' },
              { id: 'r8', text: 'All marks.', marks: ['bold', 'italic', 'underline'] }
            ]
          }
        ]
      }
    };

    const markdown = exportPieceToMarkdown(piece);
    expect(markdown).toBe('Normal text. **Bold text.** *Italic text.* <u>Underlined text.</u> ***<u>All marks.</u>***');
  });

  it('exports poem lines correctly', () => {
    const piece: Piece = {
      id: 'p1',
      title: 'Test',
      type: 'poem',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      tags: [],
      content: {
        kind: 'poem',
        blocks: [
          {
            id: 'b1',
            kind: 'line',
            runs: [{ id: 'r1', text: 'Line 1' }]
          },
          {
            id: 'b2',
            kind: 'line',
            runs: [{ id: 'r2', text: 'Line 2' }]
          }
        ]
      }
    };

    const markdown = exportPieceToMarkdown(piece);
    expect(markdown).toBe('Line 1\n\nLine 2');
  });

  it('handles quotes correctly', () => {
    const piece: Piece = {
      id: 'p1',
      title: 'Test',
      type: 'text',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      tags: [],
      content: {
        kind: 'text',
        blocks: [
          {
            id: 'b1',
            kind: 'quote',
            runs: [{ id: 'r1', text: 'This is a quote.' }]
          }
        ]
      }
    };

    const markdown = exportPieceToMarkdown(piece);
    expect(markdown).toBe('> This is a quote.');
  });

  it('throws an error for song types', () => {
    const piece: Piece = {
      id: 'p1',
      title: 'Test',
      type: 'song',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      tags: [],
      content: {
        kind: 'song',
        sections: []
      }
    };

    expect(() => exportPieceToMarkdown(piece)).toThrow('Song export not supported');
  });

  it('does not mutate the original piece', () => {
    const piece: Piece = {
      id: 'p1',
      title: 'Test',
      type: 'text',
      language: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      revision: 0,
      tags: [],
      content: {
        kind: 'text',
        blocks: [
          {
            id: 'b1',
            kind: 'paragraph',
            runs: [{ id: 'r1', text: 'Test text.', marks: ['bold'] }]
          }
        ]
      }
    };

    // Deep clone the piece for comparison
    const originalPiece = JSON.parse(JSON.stringify(piece));

    exportPieceToMarkdown(piece);

    expect(piece).toEqual(originalPiece);
  });

  it('includes YAML frontmatter header when includeFrontmatter option is true', () => {
    const piece: Piece = {
      id: 'piece-frontmatter-1',
      title: 'Obra con Metadatos',
      type: 'poem',
      language: 'es',
      createdAt: '2026-08-05T14:40:00Z',
      updatedAt: '2026-08-05T14:40:00Z',
      revision: 1,
      tags: [
        { kind: 'type', value: 'poem' },
        { kind: 'user', value: 'tag1' }
      ],
      content: {
        kind: 'poem',
        blocks: [
          {
            id: 'b1',
            kind: 'paragraph',
            runs: [{ id: 'r1', text: 'Texto del poema.' }]
          }
        ]
      }
    };

    const output = exportPieceToMarkdown(piece, { includeFrontmatter: true });

    expect(output).toContain('---');
    expect(output).toContain('id: "piece-frontmatter-1"');
    expect(output).toContain('title: "Obra con Metadatos"');
    expect(output).toContain('tags: ["tag1"]');
    expect(output).toContain('Texto del poema.');
  });
});
