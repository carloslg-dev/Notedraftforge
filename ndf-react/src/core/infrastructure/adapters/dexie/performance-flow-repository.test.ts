import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { DexiePerformanceFlowRepository } from './performance-flow-repository';
import { db } from './db';
import type { PerformanceFlow } from '../../../domain/types/';

describe('DexiePerformanceFlowRepository', () => {
  const repo = new DexiePerformanceFlowRepository();

  beforeEach(async () => {
    await db.performanceFlows.clear();
  });

  const dummyFlow: PerformanceFlow = {
    id: 'flow-1',
    title: 'Recital 2026',
    description: 'Flujo de lectura',
    tags: ['recital', '2026'],
    nodes: [
      { id: 'n1', type: 'piece', pieceId: 'p1' },
      { id: 'n2', type: 'piece', pieceId: 'p2' }
    ],
    edges: [
      { id: 'e1', sourceNodeId: 'n1', targetNodeId: 'n2', isPrimary: true }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('saves and retrieves a performance flow', async () => {
    await repo.save(dummyFlow);
    const retrieved = await repo.getById('flow-1');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Recital 2026');
    expect(retrieved?.nodes).toHaveLength(2);
  });

  it('returns null if flow does not exist', async () => {
    const retrieved = await repo.getById('non-existent');
    expect(retrieved).toBeNull();
  });

  it('retrieves all performance flows', async () => {
    await repo.save(dummyFlow);
    const list = await repo.getAll();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('flow-1');
  });

  it('deletes a performance flow', async () => {
    await repo.save(dummyFlow);
    await repo.delete('flow-1');
    const retrieved = await repo.getById('flow-1');
    expect(retrieved).toBeNull();
  });
});
