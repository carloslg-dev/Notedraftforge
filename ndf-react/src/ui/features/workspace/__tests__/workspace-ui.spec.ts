import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/core/infrastructure/adapters/dexie/db';
import { DexiePerformanceFlowRepository } from '@/core/infrastructure/adapters/dexie/performance-flow-repository';
import { CreatePerformanceFlowUseCase } from '@/core/application/performance-flow/create-performance-flow.use-case';
import { GetAllPerformanceFlowsUseCase } from '@/core/application/performance-flow/get-all-performance-flows.use-case';
import { GetPieceTraceabilityUseCase } from '@/core/application/performance-flow/get-piece-traceability.use-case';
import { CompilePerformanceFlowUseCase } from '@/core/application/performance-flow/compile-performance-flow.use-case';
import { DexiePieceRepository } from '@/core/infrastructure/adapters/dexie/piece-repository';
import { createPiece } from '@/core/domain/factories/piece';

describe('Workspace & Performance Flow UI & Application Integration', () => {
  const flowRepo = new DexiePerformanceFlowRepository();
  const pieceRepo = new DexiePieceRepository();
  const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
  const getAllUseCase = new GetAllPerformanceFlowsUseCase(flowRepo);
  const traceUseCase = new GetPieceTraceabilityUseCase(flowRepo);
  const compileUseCase = new CompilePerformanceFlowUseCase(flowRepo, pieceRepo);

  beforeEach(async () => {
    await db.performanceFlows.clear();
    await db.pieces.clear();
  });

  it('creates and lists workspaces in Dexie', async () => {
    await createUseCase.execute({
      title: 'Recital Primavera 2026',
      description: 'Poemas de prueba',
      tags: ['primavera', '2026']
    });

    const list = await getAllUseCase.execute();
    expect(list).toHaveLength(1);
    expect(list[0].title).toBe('Recital Primavera 2026');
    expect(list[0].tags).toEqual(['primavera', '2026']);
  });

  it('traces pieces across direct and composite workspaces for UI badge calculation', async () => {
    const piece = createPiece({ title: 'Verso del Amanecer', type: 'poem', language: 'es' });
    await pieceRepo.save(piece);

    const ws1 = await createUseCase.execute({
      title: 'Workspace Parte 1',
      nodes: [{ id: 'n1', type: 'piece', pieceId: piece.id }]
    });

    await createUseCase.execute({
      title: 'Workspace Completo',
      nodes: [{ id: 'n2', type: 'workspace', workspaceId: ws1.id }]
    });

    const traces = await traceUseCase.execute(piece.id);
    expect(traces).toHaveLength(2);
    const titles = traces.map((t) => t.workspaceTitle);
    expect(titles).toContain('Workspace Parte 1');
    expect(titles).toContain('Workspace Completo');
  });

  it('compiles flow into continuous reading items for AuditionPage', async () => {
    const p1 = createPiece({ title: 'Poema 1', type: 'poem', language: 'es' });
    const p2 = createPiece({ title: 'Poema 2', type: 'poem', language: 'es' });
    await pieceRepo.save(p1);
    await pieceRepo.save(p2);

    const ws = await createUseCase.execute({
      title: 'Audición',
      nodes: [
        { id: 'node-1', type: 'piece', pieceId: p1.id },
        { id: 'node-2', type: 'piece', pieceId: p2.id }
      ],
      edges: [{ id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2' }]
    });

    const items = await compileUseCase.execute(ws.id);
    expect(items).toHaveLength(2);
    expect(items[0].pieceTitle).toBe('Poema 1');
    expect(items[1].pieceTitle).toBe('Poema 2');
  });
});
