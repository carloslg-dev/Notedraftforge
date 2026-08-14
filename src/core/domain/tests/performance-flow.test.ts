import { describe, it, expect } from 'vitest';
import {
  createPerformanceFlow,
  validateNoCircularWorkspaceDependencies,
  getPieceTraceability,
  compileFlowToReadingSurface
} from '../factories/performance-flow';
import { createPiece } from '../factories/piece';
import type { PerformanceFlow } from '../types/performance-flow';
import type { Piece } from '../types/piece';

describe('PerformanceFlow Domain Entity & Operations', () => {
  it('creates a valid PerformanceFlow entity (PF-REQ-01, PF-SCN-01)', () => {
    const flow = createPerformanceFlow({
      title: 'Antología Personal 2026',
      description: 'Lectura continua para recital en vivo',
      tags: ['Recital', 'Poesía', '2026'],
      nodes: [
        { id: 'node-1', type: 'piece', pieceId: 'piece-1' },
        { id: 'node-2', type: 'piece', pieceId: 'piece-2' }
      ],
      edges: [
        { id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-2', isPrimary: true }
      ]
    });

    expect(flow.id).toBeDefined();
    expect(flow.title).toBe('Antología Personal 2026');
    expect(flow.description).toBe('Lectura continua para recital en vivo');
    expect(flow.tags).toEqual(['recital', 'poesía', '2026']);
    expect(flow.nodes).toHaveLength(2);
    expect(flow.edges).toHaveLength(1);
    expect(flow.createdAt).toBeDefined();
    expect(flow.updatedAt).toBeDefined();
  });

  it('rejects creating a PerformanceFlow with empty title', () => {
    expect(() =>
      createPerformanceFlow({
        title: '   '
      })
    ).toThrowError('PerformanceFlow title cannot be empty.');
  });

  it('rejects duplicate node IDs in flow', () => {
    expect(() =>
      createPerformanceFlow({
        title: 'Invalid Flow',
        nodes: [
          { id: 'node-1', type: 'piece', pieceId: 'piece-1' },
          { id: 'node-1', type: 'piece', pieceId: 'piece-2' }
        ]
      })
    ).toThrowError('Duplicate node ID found in PerformanceFlow: node-1');
  });

  it('rejects edges connecting non-existent nodes', () => {
    expect(() =>
      createPerformanceFlow({
        title: 'Invalid Edges Flow',
        nodes: [{ id: 'node-1', type: 'piece', pieceId: 'piece-1' }],
        edges: [{ id: 'edge-1', sourceNodeId: 'node-1', targetNodeId: 'node-999' }]
      })
    ).toThrowError("Edge target node 'node-999' does not exist in flow nodes.");
  });

  it('nests workspace inside book workspace hierarchically (PF-REQ-02, PF-SCN-02)', () => {
    const stropheA = createPiece({ title: 'Estrofa I', type: 'poem', language: 'es' });
    const stropheB = createPiece({ title: 'Estrofa II', type: 'poem', language: 'es' });

    const poemWorkspace = createPerformanceFlow({
      id: 'ws-poem',
      title: 'Poema Compuesto',
      nodes: [
        { id: 'node-p1', type: 'piece', pieceId: stropheA.id },
        { id: 'node-p2', type: 'piece', pieceId: stropheB.id }
      ],
      edges: [{ id: 'edge-p1', sourceNodeId: 'node-p1', targetNodeId: 'node-p2' }]
    });

    const bookWorkspace = createPerformanceFlow({
      id: 'ws-book',
      title: 'Libro 2026',
      nodes: [
        { id: 'node-b1', type: 'workspace', workspaceId: poemWorkspace.id }
      ]
    });

    expect(bookWorkspace.nodes[0].type).toBe('workspace');
    expect((bookWorkspace.nodes[0] as any).workspaceId).toBe('ws-poem');
  });

  it('detects and rejects circular workspace embedding (PF-REQ-02, PF-SCN-04)', () => {
    const wsA = createPerformanceFlow({
      id: 'ws-A',
      title: 'Workspace A',
      nodes: [{ id: 'n1', type: 'workspace', workspaceId: 'ws-B' }]
    });

    const wsB = createPerformanceFlow({
      id: 'ws-B',
      title: 'Workspace B',
      nodes: [{ id: 'n2', type: 'workspace', workspaceId: 'ws-A' }]
    });

    const map = new Map<string, PerformanceFlow>([
      ['ws-A', wsA],
      ['ws-B', wsB]
    ]);

    expect(() =>
      validateNoCircularWorkspaceDependencies(wsA, (id) => map.get(id))
    ).toThrowError(/Circular workspace reference detected: ws-A -> ws-B -> ws-A/);
  });

  it('traces piece usage across direct and nested workspaces (PF-REQ-04, PF-SCN-03)', () => {
    const pieceX = createPiece({ title: 'Poema Central', type: 'poem', language: 'es' });

    const wsPoem = createPerformanceFlow({
      id: 'ws-poem',
      title: 'Poema Compuesto',
      nodes: [{ id: 'n-p1', type: 'piece', pieceId: pieceX.id }]
    });

    const wsBook = createPerformanceFlow({
      id: 'ws-book',
      title: 'Libro 2026',
      nodes: [{ id: 'n-b1', type: 'workspace', workspaceId: wsPoem.id }]
    });

    const allWorkspaces = [wsPoem, wsBook];
    const trace = getPieceTraceability(pieceX.id, allWorkspaces);

    expect(trace).toHaveLength(2);
    expect(trace).toEqual([
      {
        workspaceId: 'ws-poem',
        workspaceTitle: 'Poema Compuesto',
        path: ['Poema Compuesto']
      },
      {
        workspaceId: 'ws-book',
        workspaceTitle: 'Libro 2026',
        path: ['Libro 2026', 'Poema Compuesto']
      }
    ]);
  });

  it('compiles flow to continuous reading surface with live branch selection (PF-REQ-03, PF-REQ-06, PF-SCN-05)', () => {
    const intro: Piece = {
      ...createPiece({
        title: 'Intro',
        type: 'poem',
        language: 'es'
      }),
      content: {
        kind: 'text',
        blocks: [{ id: 'b1', kind: 'paragraph', runs: [{ id: 'r1', text: 'Introducción del recital' }] }]
      }
    };

    const refrain: Piece = {
      ...createPiece({
        title: 'Estribillo',
        type: 'poem',
        language: 'es'
      }),
      content: {
        kind: 'text',
        blocks: [{ id: 'b2', kind: 'paragraph', runs: [{ id: 'r2', text: 'Canto del estribillo' }] }]
      }
    };

    const outro: Piece = {
      ...createPiece({
        title: 'Cierre',
        type: 'poem',
        language: 'es'
      }),
      content: {
        kind: 'text',
        blocks: [{ id: 'b3', kind: 'paragraph', runs: [{ id: 'r3', text: 'Palabras finales' }] }]
      }
    };

    const piecesMap = new Map([
      [intro.id, intro],
      [refrain.id, refrain],
      [outro.id, outro]
    ]);

    const flow = createPerformanceFlow({
      id: 'flow-recital',
      title: 'Recital en Vivo',
      nodes: [
        { id: 'node-intro', type: 'piece', pieceId: intro.id },
        { id: 'node-branch', type: 'branch', label: '¿Cantar estribillo?' },
        { id: 'node-refrain', type: 'piece', pieceId: refrain.id },
        { id: 'node-outro', type: 'piece', pieceId: outro.id }
      ],
      edges: [
        { id: 'e1', sourceNodeId: 'node-intro', targetNodeId: 'node-branch' },
        { id: 'e-refrain', sourceNodeId: 'node-branch', targetNodeId: 'node-refrain', label: 'Con estribillo', isPrimary: true },
        { id: 'e-skip', sourceNodeId: 'node-branch', targetNodeId: 'node-outro', label: 'Sin estribillo' },
        { id: 'e2', sourceNodeId: 'node-refrain', targetNodeId: 'node-outro' }
      ]
    });

    // Default compilation follows primary edge ("Con estribillo")
    const compiledDefault = compileFlowToReadingSurface({
      flow,
      getPieceById: (id) => piecesMap.get(id),
      getWorkspaceById: () => undefined
    });

    expect(compiledDefault.map((item) => item.pieceId)).toEqual([intro.id, refrain.id, outro.id]);

    // Live branch decision selection: choose "Sin estribillo" (edge e-skip)
    const compiledSkipped = compileFlowToReadingSurface({
      flow,
      getPieceById: (id) => piecesMap.get(id),
      getWorkspaceById: () => undefined,
      selectedDecisions: {
        'node-branch': 'e-skip'
      }
    });

    expect(compiledSkipped.map((item) => item.pieceId)).toEqual([intro.id, outro.id]);
  });
});
