import { describe, it, expect, beforeEach } from 'vitest';
import type { PerformanceFlowRepository } from '../../ports/performance-flow-repository.port';
import type { PieceRepository } from '../../ports/piece-repository';
import type { PerformanceFlow } from '../../domain/types/performance-flow';
import type { Piece } from '../../domain/types/piece';
import { CreatePerformanceFlowUseCase } from './create-performance-flow.use-case';
import { GetPerformanceFlowUseCase } from './get-performance-flow.use-case';
import { GetAllPerformanceFlowsUseCase } from './get-all-performance-flows.use-case';
import { UpdatePerformanceFlowUseCase } from './update-performance-flow.use-case';
import { DeletePerformanceFlowUseCase } from './delete-performance-flow.use-case';
import { GetPieceTraceabilityUseCase } from './get-piece-traceability.use-case';
import { CompilePerformanceFlowUseCase } from './compile-performance-flow.use-case';
import { createPiece } from '../../domain/factories/piece';

class InMemoryPerformanceFlowRepository implements PerformanceFlowRepository {
  private flows: Map<string, PerformanceFlow> = new Map();

  async getAll(): Promise<PerformanceFlow[]> {
    return Array.from(this.flows.values());
  }

  async getById(id: string): Promise<PerformanceFlow | null> {
    return this.flows.get(id) ?? null;
  }

  async save(flow: PerformanceFlow): Promise<void> {
    this.flows.set(flow.id, flow);
  }

  async delete(id: string): Promise<void> {
    this.flows.delete(id);
  }
}

class InMemoryPieceRepository implements PieceRepository {
  private pieces: Map<string, Piece> = new Map();

  async getAll(): Promise<Piece[]> {
    return Array.from(this.pieces.values());
  }

  async getById(id: string): Promise<Piece | null> {
    return this.pieces.get(id) ?? null;
  }

  async save(piece: Piece): Promise<void> {
    this.pieces.set(piece.id, piece);
  }

  async delete(id: string): Promise<void> {
    this.pieces.delete(id);
  }
}

describe('PerformanceFlow Application Use Cases', () => {
  let flowRepo: InMemoryPerformanceFlowRepository;
  let pieceRepo: InMemoryPieceRepository;

  beforeEach(() => {
    flowRepo = new InMemoryPerformanceFlowRepository();
    pieceRepo = new InMemoryPieceRepository();
  });

  it('creates and retrieves a PerformanceFlow', async () => {
    const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
    const getUseCase = new GetPerformanceFlowUseCase(flowRepo);

    const created = await createUseCase.execute({
      title: 'Mi Workspace',
      description: 'Descripción de prueba',
      tags: ['ensayo', 'poema'],
      nodes: [{ id: 'n1', type: 'piece', pieceId: 'p1' }]
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('Mi Workspace');

    const fetched = await getUseCase.execute(created.id);
    expect(fetched).toEqual(created);
  });

  it('updates an existing PerformanceFlow and checks circular dependencies', async () => {
    const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
    const updateUseCase = new UpdatePerformanceFlowUseCase(flowRepo);

    const wsA = await createUseCase.execute({ title: 'Workspace A' });
    const wsB = await createUseCase.execute({
      title: 'Workspace B',
      nodes: [{ id: 'nb1', type: 'workspace', workspaceId: wsA.id }]
    });

    // Update Workspace A to embed Workspace B -> should throw circular error
    await expect(
      updateUseCase.execute({
        id: wsA.id,
        nodes: [{ id: 'na1', type: 'workspace', workspaceId: wsB.id }]
      })
    ).rejects.toThrowError(/Circular workspace reference detected/);

    // Normal update
    const updated = await updateUseCase.execute({
      id: wsA.id,
      title: 'Workspace A Renombrado',
      description: 'Nueva descripción'
    });

    expect(updated.title).toBe('Workspace A Renombrado');
    expect(updated.description).toBe('Nueva descripción');
  });

  it('deletes a PerformanceFlow and gets all flows', async () => {
    const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
    const deleteUseCase = new DeletePerformanceFlowUseCase(flowRepo);
    const getAllUseCase = new GetAllPerformanceFlowsUseCase(flowRepo);

    const ws1 = await createUseCase.execute({ title: 'WS 1' });
    const ws2 = await createUseCase.execute({ title: 'WS 2' });

    let all = await getAllUseCase.execute();
    expect(all).toHaveLength(2);

    await deleteUseCase.execute(ws1.id);
    all = await getAllUseCase.execute();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(ws2.id);
  });

  it('gets piece traceability across workspaces', async () => {
    const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
    const traceUseCase = new GetPieceTraceabilityUseCase(flowRepo);

    const piece = createPiece({ title: 'Verso Clave', type: 'poem', language: 'es' });
    await pieceRepo.save(piece);

    const wsPoem = await createUseCase.execute({
      title: 'Poema Coral',
      nodes: [{ id: 'np1', type: 'piece', pieceId: piece.id }]
    });

    await createUseCase.execute({
      title: 'Libro Antológico',
      nodes: [{ id: 'nb1', type: 'workspace', workspaceId: wsPoem.id }]
    });

    const traces = await traceUseCase.execute(piece.id);
    expect(traces).toHaveLength(2);
    expect(traces[0].workspaceTitle).toBe('Poema Coral');
    expect(traces[1].workspaceTitle).toBe('Libro Antológico');
  });

  it('compiles performance flow with piece contents', async () => {
    const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
    const compileUseCase = new CompilePerformanceFlowUseCase(flowRepo, pieceRepo);

    const piece1: Piece = {
      ...createPiece({
        title: 'Parte 1',
        type: 'poem',
        language: 'es'
      }),
      content: {
        kind: 'text',
        blocks: [{ id: 'blk-1', kind: 'paragraph', runs: [{ id: 'r1', text: 'Contenido parte 1' }] }]
      }
    };
    const piece2: Piece = {
      ...createPiece({
        title: 'Parte 2',
        type: 'poem',
        language: 'es'
      }),
      content: {
        kind: 'text',
        blocks: [{ id: 'blk-2', kind: 'paragraph', runs: [{ id: 'r2', text: 'Contenido parte 2' }] }]
      }
    };

    await pieceRepo.save(piece1);
    await pieceRepo.save(piece2);

    const flow = await createUseCase.execute({
      title: 'Secuencia Completa',
      nodes: [
        { id: 'n1', type: 'piece', pieceId: piece1.id },
        { id: 'n2', type: 'piece', pieceId: piece2.id }
      ],
      edges: [{ id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n2' }]
    });

    const items = await compileUseCase.execute(flow.id);
    expect(items).toHaveLength(2);
    expect(items[0].pieceTitle).toBe('Parte 1');
    expect(items[1].pieceTitle).toBe('Parte 2');
    expect(items[0].workspaceBreadcrumb).toEqual(['Secuencia Completa']);
  });
});
