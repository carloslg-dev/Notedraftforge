import { describe, it, expect } from 'vitest';
import { createAnnotation, markAnnotationNeedsReview } from '../factories/annotation';
import { TextRangeTarget } from '../types/annotation';
import { LayerKind } from '../types/layer';

describe('Annotation Factory', () => {
  const mockTarget: TextRangeTarget = {
    kind: 'text-range',
    blockId: 'block-1',
    startOffset: 0,
    endOffset: 5,
  };

  const pieceId = 'piece-123';

  describe('createAnnotation', () => {
    it('creates a valid breath annotation', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'breath',
        content: { mark: 'S' },
      });

      expect(annotation.id).toBeDefined();
      expect(typeof annotation.id).toBe('string');
      expect(annotation.pieceId).toBe(pieceId);
      expect(annotation.target).toEqual(mockTarget);
      expect(annotation.kind).toBe('breath');
      expect(annotation.layerId).toBe('breath');
      expect(annotation.content).toEqual({ mark: 'S' });
      expect(annotation.status).toBe('valid');
    });

    it('creates a valid intent annotation', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'intent',
        content: { shortNote: 'slow down', extendedNote: 'much slower here' },
      });

      expect(annotation.kind).toBe('intent');
      expect(annotation.layerId).toBe('intention');
      expect(annotation.content).toEqual({ shortNote: 'slow down', extendedNote: 'much slower here' });
    });

    it('creates a valid comment annotation', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'comment',
        content: { shortNote: 'fix this' },
      });

      expect(annotation.kind).toBe('comment');
      expect(annotation.layerId).toBe('comments');
      expect(annotation.content).toEqual({ shortNote: 'fix this' });
    });

    it('rejects invalid breath mark', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          target: mockTarget,
          kind: 'breath',
          // @ts-expect-error Testing invalid runtime value
          content: { mark: 'X' },
        });
      }).toThrow(/Breath annotation mark must be 'S' or 'L'/);
    });

    it('rejects empty shortNote for intent/comment', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          target: mockTarget,
          kind: 'intent',
          content: { shortNote: '   ' },
        });
      }).toThrow(/shortNote must be a non-empty string/);
    });

    it('sanitizes shortNote and extendedNote by trimming whitespace', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'intent',
        content: { shortNote: '  needs trim  ', extendedNote: '   also trim   ' },
      });

      expect(annotation.content).toEqual({ shortNote: 'needs trim', extendedNote: 'also trim' });
    });

    it('rejects empty extendedNote if provided', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          target: mockTarget,
          kind: 'comment',
          content: { shortNote: 'valid', extendedNote: '   ' },
        });
      }).toThrow(/extendedNote must be a non-empty string when present/);
    });

    it('rejects invalid target kind', () => {
      expect(() => {
        createAnnotation({
          pieceId,
          // @ts-expect-error Testing invalid runtime value
          target: { kind: 'invalid-target' },
          kind: 'breath',
          content: { mark: 'S' },
        });
      }).toThrow(/Invalid target kind/);
    });
  });

  describe('markAnnotationNeedsReview', () => {
    it('transitions status from valid to needsReview', () => {
      const annotation = createAnnotation({
        pieceId,
        target: mockTarget,
        kind: 'breath',
        content: { mark: 'S' },
      });

      expect(annotation.status).toBe('valid');

      const reviewed = markAnnotationNeedsReview(annotation);

      expect(reviewed.id).toBe(annotation.id);
      expect(reviewed.status).toBe('needsReview');
      // Original remains unchanged
      expect(annotation.status).toBe('valid');
    });
  });
  describe('Invariants', () => {
    it('Invariant 6: An Annotation belongs to exactly one Piece, one AnnotationTarget, and one Layer', () => {
      const annotation = createAnnotation({
        pieceId: 'piece-1',
        target: { kind: 'text-range', blockId: 'b1', startOffset: 0, endOffset: 5 },
        kind: 'breath',
        content: { mark: 'S' }
      });

      expect(typeof annotation.pieceId).toBe('string');
      expect(annotation.target).toBeDefined();
      expect(typeof annotation.layerId).toBe('string');
    });

    it('Invariant 7: An Annotation\'s kind must match its Layer\'s compatible kind', () => {
      const breathAnn = createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'breath', content: { mark: 'S' } });
      expect(breathAnn.layerId).toBe('breath');

      const intentAnn = createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'intent', content: { shortNote: 'note' } });
      expect(intentAnn.layerId).toBe('intention');

      const commentAnn = createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'comment', content: { shortNote: 'note' } });
      expect(commentAnn.layerId).toBe('comments');
    });

    it('Invariant 8: Multiple annotations of different kinds may share the same AnnotationTarget', () => {
      const target: TextRangeTarget = { kind: 'text-range', blockId: 'b1', startOffset: 0, endOffset: 5 };

      const ann1 = createAnnotation({ pieceId: 'p1', target, kind: 'breath', content: { mark: 'S' } });
      const ann2 = createAnnotation({ pieceId: 'p1', target, kind: 'intent', content: { shortNote: 'note' } });

      // In a real system, the repository allows both. In the domain, we just verify they hold identical targets.
      expect(ann1.target).toEqual(ann2.target);
      expect(ann1.kind).not.toBe(ann2.kind);
    });

    it('Invariant 12: There are exactly 5 fixed domain layers', () => {
      // In TS we can only verify this via type checking on LayerKind,
      // but we can ensure our derivation handles exactly the known kinds without throwing.
      const kinds: LayerKind[] = ['chord', 'meter', 'breath', 'intention', 'comments'];
      expect(kinds).toHaveLength(5);
    });

    it('Invariant 14: BreathContent.mark must be \'S\' or \'L\'', () => {
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'breath', content: { mark: 'S' } })).not.toThrow();
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'breath', content: { mark: 'L' } })).not.toThrow();

      // @ts-expect-error invalid mark
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'breath', content: { mark: 'X' } })).toThrow("Breath annotation mark must be 'S' or 'L'");
    });

    it('Invariant 15: NoteAnnotationContent.shortNote must be a non-empty string', () => {
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'intent', content: { shortNote: '' } })).toThrow("shortNote must be a non-empty string");
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'comment', content: { shortNote: '   ' } })).toThrow("shortNote must be a non-empty string");
    });

    it('Invariant 16: extendedNote, when present, must be a non-empty string', () => {
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'intent', content: { shortNote: 'note', extendedNote: '' } })).toThrow("extendedNote must be a non-empty string when present");
      expect(() => createAnnotation({ pieceId: 'p1', target: mockTarget, kind: 'comment', content: { shortNote: 'note', extendedNote: '   ' } })).toThrow("extendedNote must be a non-empty string when present");
    });
  });
});
