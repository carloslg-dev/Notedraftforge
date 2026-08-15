import { describe, it, expect } from 'vitest';
import { createPiece, updatePieceContent, updatePieceMetadata } from '../factories/piece';
import { TextPieceContent, PoemPieceContent, PieceContent } from '../types/piece';
import { PieceSnapshot } from '../types/annotation';

describe('Piece Entity', () => {
  describe('createPiece', () => {
    it('creates a valid piece with all fields initialized', () => {
      const piece = createPiece({
        title: 'My First Poem',
        type: 'poem',
        language: 'en',
        tags: ['inspiration', 'nature'],
      });

      expect(piece.id).toBeDefined();
      expect(typeof piece.id).toBe('string');
      expect(piece.title).toBe('My First Poem');
      expect(piece.type).toBe('poem');
      expect(piece.language).toBe('en');
      expect(piece.revision).toBe(0);

      expect(piece.createdAt).toBeDefined();
      expect(piece.updatedAt).toBeDefined();
      expect(piece.createdAt).toBe(piece.updatedAt);

      expect(piece.content).toEqual({ kind: 'poem', blocks: [] });

      expect(piece.tags).toHaveLength(3);
      expect(piece.tags[0]).toEqual({ kind: 'type', value: 'poem' });
      expect(piece.tags[1]).toEqual({ kind: 'user', value: 'inspiration' });
      expect(piece.tags[2]).toEqual({ kind: 'user', value: 'nature' });
    });

    it('initializes correct content structure for text type', () => {
      const piece = createPiece({ title: 'A Text', type: 'text', language: 'en' });
      expect(piece.content).toEqual({ kind: 'text', blocks: [] });
      expect(piece.type).toBe('text');
      expect(piece.tags[0]).toEqual({ kind: 'type', value: 'text' });
    });

    it('initializes correct content structure for song type', () => {
      const piece = createPiece({ title: 'A Song', type: 'song', language: 'en' });
      expect(piece.content).toEqual({ kind: 'song', sections: [] });
      expect(piece.type).toBe('song');
      expect(piece.tags[0]).toEqual({ kind: 'type', value: 'song' });
    });

    it('throws error if title is empty or just whitespace', () => {
      expect(() => createPiece({ title: '', type: 'poem', language: 'en' })).toThrow('Piece title cannot be empty');
      expect(() => createPiece({ title: '   ', type: 'poem', language: 'en' })).toThrow('Piece title cannot be empty');
    });

    it('trims user tags and ignores empty ones', () => {
      const piece = createPiece({
        title: 'Title',
        type: 'text',
        language: 'en',
        tags: ['  tag1  ', '', 'tag2', '   '],
      });
      expect(piece.tags).toEqual([
        { kind: 'type', value: 'text' },
        { kind: 'user', value: 'tag1' },
        { kind: 'user', value: 'tag2' },
      ]);
    });
  });

  describe('updatePieceContent', () => {
    it('updates content, increments revision, and updates updatedAt', () => {
      const piece = createPiece({ title: 'Test', type: 'poem', language: 'en' });


      // Delay to ensure a new timestamp (not strictly needed with ISO strings if fast enough,
      // but safe to mock or just check it's >= old)
      // Actually we can just check it's a string, or mock Date.

      const newContent: PoemPieceContent = {
        kind: 'poem',
        blocks: [{ id: 'b1', kind: 'line', runs: [{ id: 'r1', text: 'Hello' }] }]
      };

      const updatedPiece = updatePieceContent(piece, newContent);

      expect(updatedPiece.content).toBe(newContent);
      expect(updatedPiece.revision).toBe(1);
      expect(updatedPiece.updatedAt).toBeDefined();
      // If tests run fast, updatedAt might be the same string, but revision must increment
      expect(updatedPiece.id).toBe(piece.id); // Same ID
    });

    it('throws error if content.kind does not match piece.type', () => {
      const piece = createPiece({ title: 'Test', type: 'poem', language: 'en' });

      const wrongContent: TextPieceContent = {
        kind: 'text',
        blocks: []
      };

      expect(() => updatePieceContent(piece, wrongContent)).toThrow("Content kind 'text' does not match piece type 'poem'");
    });
  });

  describe('updatePieceMetadata', () => {
    it('updates metadata without incrementing revision', () => {
      const piece = createPiece({ title: 'Old Title', type: 'text', language: 'en', tags: ['oldTag'] });

      const updatedPiece = updatePieceMetadata(piece, {
        title: 'New Title',
        language: 'es',
        tags: ['newTag']
      });

      expect(updatedPiece.title).toBe('New Title');
      expect(updatedPiece.language).toBe('es');
      expect(updatedPiece.tags).toEqual([
        { kind: 'type', value: 'text' }, // type tag preserved
        { kind: 'user', value: 'newTag' }
      ]);
      expect(updatedPiece.revision).toBe(0); // revision NOT incremented
      expect(updatedPiece.updatedAt).toBeDefined();
    });

    it('allows partial updates', () => {
      const piece = createPiece({ title: 'Title', type: 'text', language: 'en' });

      const updatedPiece = updatePieceMetadata(piece, { title: 'New Title' });

      expect(updatedPiece.title).toBe('New Title');
      expect(updatedPiece.language).toBe('en'); // unchanged
      expect(updatedPiece.tags).toEqual([{ kind: 'type', value: 'text' }]); // unchanged
      expect(updatedPiece.revision).toBe(0);
    });

    it('throws error if new title is empty', () => {
      const piece = createPiece({ title: 'Title', type: 'text', language: 'en' });

      expect(() => updatePieceMetadata(piece, { title: '   ' })).toThrow('Piece title cannot be empty');
      expect(() => updatePieceMetadata(piece, { title: '' })).toThrow('Piece title cannot be empty');
    });
  });

  describe('Invariants', () => {
    it('Invariant 1: A Piece has structured PieceContent by discriminator (text, poem, song)', () => {
      const textPiece = createPiece({ title: 'T', type: 'text', language: 'en' });
      expect(textPiece.content).toHaveProperty('kind', 'text');
      expect(textPiece.content).toHaveProperty('blocks');

      const poemPiece = createPiece({ title: 'P', type: 'poem', language: 'en' });
      expect(poemPiece.content).toHaveProperty('kind', 'poem');
      expect(poemPiece.content).toHaveProperty('blocks');

      const songPiece = createPiece({ title: 'S', type: 'song', language: 'en' });
      expect(songPiece.content).toHaveProperty('kind', 'song');
      expect(songPiece.content).toHaveProperty('sections');
    });

    it('Invariant 2: Piece.type must match Piece.content.kind', () => {
      const piece = createPiece({ title: 'T', type: 'text', language: 'en' });
      expect(piece.type).toBe(piece.content.kind);

      const invalidContent: PieceContent = { kind: 'poem', blocks: [] };
      expect(() => updatePieceContent(piece, invalidContent)).toThrow("Content kind 'poem' does not match piece type 'text'");
    });

    it('Invariant 3: A Piece must have exactly one system-managed type tag whose value matches Piece.type', () => {
      const piece = createPiece({ title: 'Test', type: 'poem', language: 'en', tags: ['user1', 'poem'] });

      const typeTags = piece.tags.filter(t => t.kind === 'type');
      expect(typeTags).toHaveLength(1);
      expect(typeTags[0].value).toBe('poem');

      const updatedPiece = updatePieceMetadata(piece, { tags: ['user2'] });
      const updatedTypeTags = updatedPiece.tags.filter(t => t.kind === 'type');
      expect(updatedTypeTags).toHaveLength(1);
      expect(updatedTypeTags[0].value).toBe('poem');
    });

    it('Invariant 4 & 5: A Piece has zero or more Annotation entities, and zero is valid', () => {
      const piece = createPiece({ title: 'T', type: 'text', language: 'en' });
      // The Piece domain object does not hold an annotations array,
      // confirming annotations are managed externally and a zero-annotation piece is valid.
      expect(piece).not.toHaveProperty('annotations');
    });

    it('Invariant 9 & 13: PieceSnapshot contains layer visibility and sourceRevision matching Piece.revision', () => {
      const piece = createPiece({ title: 'T', type: 'text', language: 'en' });

      const snapshot: PieceSnapshot = {
        pieceId: piece.id,
        html: '<div></div>',
        layerVisibility: {
          chord: true,
          meter: false,
          breath: false,
          intention: false,
          comments: false
        },
        sourceRevision: piece.revision,
        generatedAt: new Date().toISOString()
      };

      // Ensure snapshot revision strictly matches piece revision
      expect(snapshot.sourceRevision).toStrictEqual(piece.revision);

      const updatedPiece = updatePieceContent(piece, { kind: 'text', blocks: [] });
      expect(snapshot.sourceRevision).not.toStrictEqual(updatedPiece.revision); // Stale snapshot
    });

    it('Invariant 10: Markdown is an import/export concern only, never the domain source of truth', () => {
      const piece = createPiece({ title: 'T', type: 'text', language: 'en' });
      // The content structure must be our explicit objects (blocks/runs), not a string of markdown
      expect(typeof piece.content).not.toBe('string');
      expect(piece.content).toHaveProperty('blocks');
    });
  });
});
