import { describe, it, expect } from 'vitest';
import {
  parseYamlFrontmatter,
  parseYamlMarkdownToPiece,
  serializePieceToYamlMarkdown
} from './yaml-frontmatter';
import { createPiece } from '../../domain/factories/piece';

describe('yaml-frontmatter', () => {
  it('parses YAML frontmatter header and body text correctly', () => {
    const raw = `---
id: "piece-123"
title: "La casa de ecos"
type: "poem"
language: "es"
revision: 2
tags: ["trauma", "infancia", "ausencia"]
createdAt: "2026-08-05T14:40:00Z"
updatedAt: "2026-08-05T14:45:00Z"
---
¿Dónde está mi madre?
Mi voz,
tan vacía...`;

    const { metadata, body } = parseYamlFrontmatter(raw);

    expect(metadata.id).toBe('piece-123');
    expect(metadata.title).toBe('La casa de ecos');
    expect(metadata.type).toBe('poem');
    expect(metadata.language).toBe('es');
    expect(metadata.revision).toBe(2);
    expect(metadata.tags).toEqual(['trauma', 'infancia', 'ausencia']);
    expect(metadata.createdAt).toBe('2026-08-05T14:40:00Z');
    expect(metadata.updatedAt).toBe('2026-08-05T14:45:00Z');

    expect(body).toContain('¿Dónde está mi madre?');
  });

  it('converts YAML markdown string into a valid domain Piece entity', () => {
    const raw = `---
id: "piece-456"
title: "Poema de otoño"
type: "poem"
language: "es"
revision: 1
tags: ["naturaleza", "viento"]
---
Caen las hojas rojas.`;

    const piece = parseYamlMarkdownToPiece(raw);

    expect(piece.id).toBe('piece-456');
    expect(piece.title).toBe('Poema de otoño');
    expect(piece.type).toBe('poem');
    expect(piece.revision).toBe(1);
    expect(piece.tags).toEqual([
      { kind: 'type', value: 'poem' },
      { kind: 'user', value: 'naturaleza' },
      { kind: 'user', value: 'viento' }
    ]);
    expect(piece.content.kind).toBe('poem');
  });

  it('serializes domain Piece entity into clean YAML frontmatter Markdown', () => {
    const piece = createPiece({
      title: 'Versos de la noche',
      type: 'poem',
      language: 'es'
    });
    piece.content = {
      kind: 'poem',
      blocks: [
        {
          id: 'b-1',
          kind: 'paragraph',
          runs: [{ id: 'r-1', text: 'La luna observa en silencio.' }]
        }
      ]
    };
    piece.tags = [
      { kind: 'type', value: 'poem' },
      { kind: 'user', value: 'noche' },
      { kind: 'user', value: 'silencio' }
    ];

    const markdownOutput = serializePieceToYamlMarkdown(piece);

    expect(markdownOutput).toContain('---');
    expect(markdownOutput).toContain(`id: "${piece.id}"`);
    expect(markdownOutput).toContain('title: "Versos de la noche"');
    expect(markdownOutput).toContain('tags: ["noche", "silencio"]');
    expect(markdownOutput).toContain('La luna observa en silencio.');
  });
});
