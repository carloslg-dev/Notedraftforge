import { useState, useEffect, useCallback } from 'react';
import { GetAllPiecesUseCase } from '../../../core/application/piece-management/get-all-pieces.use-case';
import { DexiePieceRepository } from '../../../core/infrastructure/adapters/dexie/piece-repository';
import type { Piece } from '../../../core/domain/types/';

export function useWorkList() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPieces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const repository = new DexiePieceRepository();
      const useCase = new GetAllPiecesUseCase(repository);
      const data = await useCase.execute();

      if (data.length === 0) {
        // Initialize with default mock pieces on first load to prevent blank screen
        const initialMockPieces: Piece[] = [
          {
            id: '1',
            title: 'Draft Notes',
            type: 'text',
            content: {
              kind: 'text',
              blocks: [
                {
                  id: 'block-1',
                  kind: 'paragraph',
                  runs: [
                    { id: 'run-1', text: 'Esta es una nota de borrador en NoteDraftForge.' }
                  ]
                }
              ]
            },
            language: 'es',
            tags: [{ kind: 'type', value: 'text' }, { kind: 'user', value: 'Draft' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            revision: 1
          },
          {
            id: '2',
            title: 'Spring Poem',
            type: 'poem',
            content: {
              kind: 'poem',
              blocks: [
                {
                  id: 'block-2',
                  kind: 'line',
                  runs: [
                    { id: 'run-2', text: 'La primavera ha venido,' }
                  ]
                },
                {
                  id: 'block-3',
                  kind: 'line',
                  runs: [
                    { id: 'run-3', text: 'nadie sabe cómo ha sido.' }
                  ]
                }
              ]
            },
            language: 'es',
            tags: [{ kind: 'type', value: 'poem' }, { kind: 'user', value: 'love' }, { kind: 'user', value: 'nature' }],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            revision: 1
          }
        ];

        for (const p of initialMockPieces) {
          await repository.save(p);
        }
        setPieces(initialMockPieces);
      } else {
        setPieces(data);
      }
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPieces();
  }, [fetchPieces]);

  return {
    pieces,
    loading,
    error,
    refresh: fetchPieces,
  };
}
