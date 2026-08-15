import { describe, it, expect, beforeEach } from 'vitest';
import { CreateAnnotationUseCase } from './create-annotation.use-case';
import type { PieceRepository, AnnotationRepository } from '../../ports';
import type { Piece, Annotation } from '../../domain/types/';
import { createPiece } from '../../domain/factories/piece';

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

class MockAnnotationRepository implements AnnotationRepository {
  private annotations = new Map<string, Annotation>();

  async getByPieceId(pieceId: string): Promise<Annotation[]> {
    return Array.from(this.annotations.values()).filter(a => a.pieceId === pieceId);
  }

  async save(annotation: Annotation): Promise<void> {
    this.annotations.set(annotation.id, annotation);
  }

  async delete(id: string): Promise<void> {
    this.annotations.delete(id);
  }

  async deleteByPieceId(pieceId: string): Promise<void> {
    for (const [id, a] of this.annotations.entries()) {
      if (a.pieceId === pieceId) {
        this.annotations.delete(id);
      }
    }
  }
}

describe('CreateAnnotationUseCase', () => {
  let pieceRepo: MockPieceRepository;
  let annotationRepo: MockAnnotationRepository;
  let useCase: CreateAnnotationUseCase;
  let samplePiece: Piece;

  beforeEach(async () => {
    pieceRepo = new MockPieceRepository();
    annotationRepo = new MockAnnotationRepository();
    useCase = new CreateAnnotationUseCase(pieceRepo, annotationRepo);

    samplePiece = createPiece({
      title: 'Sample Poem',
      type: 'poem',
      language: 'es'
    });
    samplePiece.content = {
      kind: 'poem',
      blocks: [
        {
          id: 'block-1',
          kind: 'paragraph',
          runs: [{ id: 'run-1', text: 'Caminante no hay camino' }]
        }
      ]
    };

    await pieceRepo.save(samplePiece);
  });

  it('creates and saves a breath annotation', async () => {
    const annotation = await useCase.execute({
      pieceId: samplePiece.id,
      kind: 'breath',
      target: {
        kind: 'text-range',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 9
      },
      content: { mark: 'S' }
    });

    expect(annotation).toBeDefined();
    expect(annotation.id).toBeDefined();
    expect(annotation.kind).toBe('breath');
    expect(annotation.layerId).toBe('breath');
    expect(annotation.status).toBe('valid');

    const savedPiece = await pieceRepo.getById(samplePiece.id);
    expect(savedPiece?.revision).toBe(samplePiece.revision + 1);

    const savedAnnotations = await annotationRepo.getByPieceId(samplePiece.id);
    expect(savedAnnotations).toHaveLength(1);
    expect(savedAnnotations[0].id).toBe(annotation.id);
  });

  it('creates and saves an intention annotation with shortNote and extendedNote', async () => {
    const annotation = await useCase.execute({
      pieceId: samplePiece.id,
      kind: 'intent',
      target: {
        kind: 'text-range',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 22
      },
      content: {
        shortNote: 'Pausa melancólica',
        extendedNote: 'Dar énfasis a la metáfora del camino al andar'
      }
    });

    expect(annotation.kind).toBe('intent');
    expect(annotation.layerId).toBe('intention');
    expect(annotation.content).toEqual({
      shortNote: 'Pausa melancólica',
      extendedNote: 'Dar énfasis a la metáfora del camino al andar'
    });
  });

  it('rejects if piece does not exist', async () => {
    await expect(
      useCase.execute({
        pieceId: 'non-existent',
        kind: 'breath',
        target: {
          kind: 'text-range',
          blockId: 'block-1',
          startOffset: 0,
          endOffset: 5
        },
        content: { mark: 'L' }
      })
    ).rejects.toThrow('Piece not found: non-existent');
  });

  it('rejects if target block does not exist', async () => {
    await expect(
      useCase.execute({
        pieceId: samplePiece.id,
        kind: 'comment',
        target: {
          kind: 'text-range',
          blockId: 'unknown-block',
          startOffset: 0,
          endOffset: 5
        },
        content: { shortNote: 'Comentario técnico' }
      })
    ).rejects.toThrow('Target block not found in piece: unknown-block');
  });
});
