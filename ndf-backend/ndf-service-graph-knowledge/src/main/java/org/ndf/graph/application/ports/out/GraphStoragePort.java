package org.ndf.graph.application.ports.out;

import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.PieceTraceability;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.WorkspaceSubgraph;

public interface GraphStoragePort {
    void storeFlow(PerformanceFlow flow);
    PieceTraceability findPieceTraceability(String pieceId);
    WorkspaceSubgraph findWorkspaceSubgraph(String workspaceId);
}
