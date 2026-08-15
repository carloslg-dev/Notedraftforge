package org.ndf.graph.application.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase;
import org.ndf.graph.application.ports.in.IngestPerformanceFlowUseCase;
import org.ndf.graph.application.ports.out.GraphStoragePort;

import java.util.Objects;

@ApplicationScoped
public class GraphKnowledgeService implements GetPieceTraceabilityUseCase, GetWorkspaceSubgraphUseCase, IngestPerformanceFlowUseCase {

    private final GraphStoragePort graphStoragePort;

    @Inject
    public GraphKnowledgeService(GraphStoragePort graphStoragePort) {
        this.graphStoragePort = Objects.requireNonNull(graphStoragePort, "graphStoragePort cannot be null");
    }

    @Override
    public PieceTraceability getTraceability(String pieceId) {
        Objects.requireNonNull(pieceId, "pieceId cannot be null");
        return graphStoragePort.findPieceTraceability(pieceId);
    }

    @Override
    public WorkspaceSubgraph getSubgraph(String workspaceId) {
        Objects.requireNonNull(workspaceId, "workspaceId cannot be null");
        return graphStoragePort.findWorkspaceSubgraph(workspaceId);
    }

    @Override
    public void ingestFlow(PerformanceFlow flow) {
        Objects.requireNonNull(flow, "flow cannot be null");
        graphStoragePort.storeFlow(flow);
    }
}
