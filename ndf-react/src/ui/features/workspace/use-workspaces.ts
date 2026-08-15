import { useState, useEffect, useCallback } from 'react';
import type { PerformanceFlow, PieceTraceabilityReference } from '@/core/domain/types';
import { DexiePerformanceFlowRepository } from '@/core/infrastructure/adapters/dexie/performance-flow-repository';
import { GetAllPerformanceFlowsUseCase } from '@/core/application/performance-flow/get-all-performance-flows.use-case';
import { CreatePerformanceFlowUseCase, type CreatePerformanceFlowInput } from '@/core/application/performance-flow/create-performance-flow.use-case';
import { UpdatePerformanceFlowUseCase, type UpdatePerformanceFlowInput } from '@/core/application/performance-flow/update-performance-flow.use-case';
import { DeletePerformanceFlowUseCase } from '@/core/application/performance-flow/delete-performance-flow.use-case';
import { GetPieceTraceabilityUseCase } from '@/core/application/performance-flow/get-piece-traceability.use-case';

const flowRepo = new DexiePerformanceFlowRepository();
const getAllUseCase = new GetAllPerformanceFlowsUseCase(flowRepo);
const createUseCase = new CreatePerformanceFlowUseCase(flowRepo);
const updateUseCase = new UpdatePerformanceFlowUseCase(flowRepo);
const deleteUseCase = new DeletePerformanceFlowUseCase(flowRepo);
const traceUseCase = new GetPieceTraceabilityUseCase(flowRepo);

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<PerformanceFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUseCase.execute();
      setWorkspaces(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load workspaces'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const createWorkspace = async (input: CreatePerformanceFlowInput): Promise<PerformanceFlow> => {
    const created = await createUseCase.execute(input);
    await refreshWorkspaces();
    return created;
  };

  const updateWorkspace = async (input: UpdatePerformanceFlowInput): Promise<PerformanceFlow> => {
    const updated = await updateUseCase.execute(input);
    await refreshWorkspaces();
    return updated;
  };

  const deleteWorkspace = async (id: string): Promise<void> => {
    await deleteUseCase.execute(id);
    await refreshWorkspaces();
  };

  const getTraceability = async (pieceId: string): Promise<PieceTraceabilityReference[]> => {
    return traceUseCase.execute(pieceId);
  };

  return {
    workspaces,
    loading,
    error,
    refreshWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    getTraceability
  };
}
