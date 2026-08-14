import Dexie, { type Table } from 'dexie';
import type { Piece, Annotation, PieceSnapshot, PerformanceFlow } from '../../../domain/types/';

export class NotedraftDatabase extends Dexie {
  pieces!: Table<Piece, string>;
  annotations!: Table<Annotation, string>;
  snapshots!: Table<PieceSnapshot, string>;
  performanceFlows!: Table<PerformanceFlow, string>;

  constructor() {
    super('NotedraftDatabase');
    this.version(1).stores({
      pieces: 'id',
      annotations: 'id, pieceId',
      snapshots: 'pieceId',
    });
    this.version(2).stores({
      pieces: 'id',
      annotations: 'id, pieceId',
      snapshots: 'pieceId',
      performanceFlows: 'id, *tags',
    });
  }
}

export const db = new NotedraftDatabase();
export default db;
