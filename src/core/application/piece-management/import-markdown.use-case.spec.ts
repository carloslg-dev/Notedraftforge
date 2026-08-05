import { describe, it, expect, beforeEach } from 'vitest';
import { ImportMarkdownUseCase } from './import-markdown.use-case';
import type { PieceRepository, MarkdownParserPort } from '../../ports/';
import type { Piece, TextBlock, TextPieceContent } from '../../domain/types/';

class MockPieceRepository implements PieceRepository {
  private pieces = new Map<string, Piece>();

  async getAll(): Promise<Piece[]> {
    return Array.from(this.pieces.values());
  }

  async getById(id: string): Promise<Piece | null> {
    return this.pieces.get(id) || null;
  }

  async save(piece: Piece): Promise<void> {
    this.pieces.set(piece.id, piece);
  }

  async delete(id: string): Promise<void> {
    this.pieces.delete(id);
  }
}

class MockMarkdownParser implements MarkdownParserPort {
  parse(markdown: string): TextBlock[] {
    if (markdown === 'unsupported') {
      return [];
    }

    return [
      {
        id: 'mock-block-1',
        kind: 'heading',
        runs: [{ id: 'run-1', text: 'Hello' }]
      },
      {
        id: 'mock-block-2',
        kind: 'paragraph',
        runs: [
          { id: 'run-2', text: 'This is ' },
          { id: 'run-3', text: 'bold', marks: ['bold'] }
        ]
      }
    ];
  }
}

describe('ImportMarkdownUseCase', () => {
  let repository: MockPieceRepository;
  let parser: MockMarkdownParser;
  let useCase: ImportMarkdownUseCase;

  beforeEach(() => {
    repository = new MockPieceRepository();
    parser = new MockMarkdownParser();
    useCase = new ImportMarkdownUseCase(repository, parser);
  });

  it('imports markdown and creates a piece with parsed text content', async () => {
    const markdownContent = '# Hello\n\nThis is **bold**';
    const piece = await useCase.execute({
      title: 'Imported File',
      markdown: markdownContent,
      language: 'en'
    });

    expect(piece).toBeDefined();
    expect(piece.id).toBeDefined();
    expect(piece.title).toBe('Imported File');
    expect(piece.type).toBe('text');
    expect(piece.language).toBe('en');
    expect(piece.revision).toBe(0);

    const content = piece.content as TextPieceContent;
    expect(content.kind).toBe('text');
    expect(content.blocks).toHaveLength(2);
    expect(content.blocks[0].kind).toBe('heading');
    expect(content.blocks[0].runs[0].text).toBe('Hello');
    expect(content.blocks[1].kind).toBe('paragraph');
    expect(content.blocks[1].runs[1].marks).toContain('bold');

    const savedPiece = await repository.getById(piece.id);
    expect(savedPiece).toEqual(piece);
  });

  it('creates piece with empty blocks if markdown only contains unsupported structures', async () => {
    const markdownContent = 'unsupported';
    const piece = await useCase.execute({
      title: 'Empty File',
      markdown: markdownContent,
      language: 'en'
    });

    expect(piece).toBeDefined();
    expect(piece.title).toBe('Empty File');

    const content = piece.content as TextPieceContent;
    expect(content.blocks).toHaveLength(0);
  });

  it('imports markdown with YAML frontmatter headers preserving text content and structure', async () => {
    const markdownContent = `---
title: "Poema de la Noche"
type: "poem"
language: "es"
tags: ["nocturno", "estrellas"]
---
La luna vaga solitaria.`;

    const piece = await useCase.execute({
      title: 'Poema de la Noche',
      markdown: markdownContent,
      language: 'es'
    });

    expect(piece.id).toBeDefined();
    expect(piece.title).toBe('Poema de la Noche');
    expect(piece.type).toBe('text');
    expect(piece.language).toBe('es');
    expect(piece.revision).toBe(0);
    const content = piece.content as TextPieceContent;
    expect(content.blocks).toHaveLength(2);
    expect(content.blocks[0].runs[0].text).toBe('Hello');
  });
});
