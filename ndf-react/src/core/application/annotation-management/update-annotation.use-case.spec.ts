import { describe, it, expect, beforeEach } from 'vitest';
import { UpdateAnnotationUseCase } from './update-annotation.use-case';
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

  async getById(id: string): Promise<Annotation | null> {
    return this.annotations.get(id) || null;
  }

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

describe('UpdateAnnotationUseCase', () => {
  let pieceRepo: MockPieceRepository;
  let annotationRepo: MockAnnotationRepository;
  let createUseCase: CreateAnnotationUseCase;
  let updateUseCase: UpdateAnnotationUseCase;
  let samplePiece: Piece;
  let createdAnnotation: Annotation;

  beforeEach(async () => {
    pieceRepo = new MockPieceRepository();
    annotationRepo = new MockAnnotationRepository();
    createUseCase = new CreateAnnotationUseCase(pieceRepo, annotationRepo);
    updateUseCase = new UpdateAnnotationUseCase(pieceRepo, annotationRepo);

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

    createdAnnotation = await createUseCase.execute({
      pieceId: samplePiece.id,
      kind: 'intent',
      target: {
        kind: 'text-range',
        blockId: 'block-1',
        startOffset: 0,
        endOffset: 9
      },
      content: { shortNote: 'Pausa inicial' }
    });
  });

  it('updates annotation content and increments piece revision', async () => {
    const updated = await updateUseCase.execute({
      annotationId: createdAnnotation.id,
      pieceId: samplePiece.id,
      content: {
        shortNote: 'Pausa dramática modificada',
        extendedNote: 'Explicación extendida de la pausa'
      }
    });

    expect(updated.id).toBe(createdAnnotation.id);
    expect(updated.content).toEqual({
      shortNote: 'Pausa dramática modificada',
      extendedNote: 'Explicación extendida de la pausa'
    });

    const savedPiece = await pieceRepo.getById(samplePiece.id);
    expect(savedPiece?.revision).toBe(samplePiece.revision + 2); // 1 from create, 1 from update
  });

  it('rejects update if annotation does not exist', async () => {
    await expect(
      updateUseCase.execute({
        annotationId: 'non-existent-ann',
        pieceId: samplePiece.id,
        content: { shortNote: 'Test' }
      })
    ).rejects.toThrow('Annotation not found: non-existent-ann');
  });

  it('rejects update if shortNote is empty for intent annotation', async () => {
    await expect(
      updateUseCase.execute({
        annotationId: createdAnnotation.id,
        pieceId: samplePiece.id,
        content: { shortNote: '   ' }
      })
    ).rejects.toThrow('shortNote cannot be empty');
  });
});
