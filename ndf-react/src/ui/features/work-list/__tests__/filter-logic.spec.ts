import { describe, it, expect } from 'vitest';
import type { Piece, PieceType } from '../../../../core/domain/types/';
import { computeVisiblePieces, computeAvailableUserTags, computeFilteredPieces } from '../filter-logic';

describe('Work List Filtering Logic', () => {
  const createMockPiece = (id: string, type: string, tags: {kind: 'type' | 'user', value: string}[]): Piece => ({
    id,
    title: 'Test',
    type: type as PieceType,
    content: { kind: 'text', blocks: [] },
    language: 'en',
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    revision: 1
  });

  const pieces: Piece[] = [
    createMockPiece('1', 'text', [{ kind: 'type', value: 'text' }, { kind: 'user', value: 'Draft' }]),
    createMockPiece('2', 'poem', [{ kind: 'type', value: 'poem' }, { kind: 'user', value: 'love' }, { kind: 'user', value: 'nature' }]),
    createMockPiece('3', 'song', [{ kind: 'type', value: 'song' }]),
    createMockPiece('4', 'text', [{ kind: 'type', value: 'text' }, { kind: 'user', value: 'ideas' }]),
  ];

  it('filters out song pieces', () => {
    const visible = computeVisiblePieces(pieces);
    expect(visible).toHaveLength(3);
    expect(visible.find(p => p.id === '3')).toBeUndefined();
  });

  it('computes unique, sorted user tags preserving casing', () => {
    const visible = computeVisiblePieces(pieces);
    const tags = computeAvailableUserTags(visible);
    expect(tags).toEqual(['Draft', 'ideas', 'love', 'nature']);
  });

  it('filters by type OR logic', () => {
    const visible = computeVisiblePieces(pieces);
    const textOnly = computeFilteredPieces(visible, ['text'], []);
    expect(textOnly).toHaveLength(2);
    expect(textOnly.every(p => p.tags!.find(t => t.kind === 'type')?.value === 'text')).toBe(true);
  });

  it('filters by user tags AND logic (case insensitive)', () => {
    const visible = computeVisiblePieces(pieces);
    const draftOnly = computeFilteredPieces(visible, [], ['draft']); // lower case filter, mixed case tag
    expect(draftOnly).toHaveLength(1);
    expect(draftOnly[0].id).toBe('1');
  });

  it('combines type and user filters', () => {
    const visible = computeVisiblePieces(pieces);
    const result = computeFilteredPieces(visible, ['poem'], ['love']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');

    const resultEmpty = computeFilteredPieces(visible, ['text'], ['love']);
    expect(resultEmpty).toHaveLength(0);
  });
});
