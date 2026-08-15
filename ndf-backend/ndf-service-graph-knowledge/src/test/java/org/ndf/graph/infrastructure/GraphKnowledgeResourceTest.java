package org.ndf.graph.infrastructure;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.contracts.graph.model.TraceabilityResponseDTO;
import org.ndf.contracts.graph.model.WorkspaceSubgraphDTO;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.PieceTraceability;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.TraceReference;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.GraphEdgeInfo;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.GraphNodeInfo;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.WorkspaceSubgraph;
import org.ndf.graph.application.ports.in.IngestPerformanceFlowUseCase;
import org.ndf.graph.infrastructure.adapters.in.rest.GraphKnowledgeResource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GraphKnowledgeResourceTest {

    private FakeTraceabilityUseCase traceabilityUseCase;
    private FakeSubgraphUseCase subgraphUseCase;
    private FakeIngestUseCase ingestUseCase;
    private GraphKnowledgeResource resource;

    @BeforeEach
    void setUp() {
        traceabilityUseCase = new FakeTraceabilityUseCase();
        subgraphUseCase = new FakeSubgraphUseCase();
        ingestUseCase = new FakeIngestUseCase();
        resource = new GraphKnowledgeResource(traceabilityUseCase, subgraphUseCase, ingestUseCase);
    }

    @Test
    @DisplayName("Should return 200 OK with TraceabilityResponseDTO when piece has references")
    void shouldReturnTraceabilityResponse() {
        TraceReference ref = new TraceReference("ws-1", "Libro 2026", "piece", null);
        traceabilityUseCase.resultToReturn = new PieceTraceability("p-1", 1, List.of(ref));

        Response response = resource.getPieceTraceability("p-1");

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(TraceabilityResponseDTO.class);
        TraceabilityResponseDTO dto = (TraceabilityResponseDTO) response.getEntity();
        assertThat(dto.getPieceId()).isEqualTo("p-1");
        assertThat(dto.getReferenceCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return 200 OK with WorkspaceSubgraphDTO when requesting workspace subgraph")
    void shouldReturnWorkspaceSubgraph() {
        GraphNodeInfo node = new GraphNodeInfo("n1", "piece", "Poema 1");
        GraphEdgeInfo edge = new GraphEdgeInfo("n1", "n2", "primary", null);
        subgraphUseCase.resultToReturn = new WorkspaceSubgraph("ws-1", 1, List.of(node), List.of(edge));

        Response response = resource.getWorkspaceSubgraph("ws-1");

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(WorkspaceSubgraphDTO.class);
        WorkspaceSubgraphDTO dto = (WorkspaceSubgraphDTO) response.getEntity();
        assertThat(dto.getRootWorkspaceId()).isEqualTo("ws-1");
        assertThat(dto.getTotalNodes()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return 200 OK when ingesting a performance flow")
    void shouldIngestPerformanceFlow() {
        PerformanceFlow flow = PerformanceFlow.createNew("ws-99", "Show", "Desc");
        Response response = resource.ingestFlow(flow);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(ingestUseCase.lastIngestedFlow).isEqualTo(flow);
    }

    private static class FakeTraceabilityUseCase implements GetPieceTraceabilityUseCase {
        PieceTraceability resultToReturn;

        @Override
        public PieceTraceability getTraceability(String pieceId) {
            return resultToReturn != null ? resultToReturn : new PieceTraceability(pieceId, 0, List.of());
        }
    }

    private static class FakeSubgraphUseCase implements GetWorkspaceSubgraphUseCase {
        WorkspaceSubgraph resultToReturn;

        @Override
        public WorkspaceSubgraph getSubgraph(String workspaceId) {
            return resultToReturn != null ? resultToReturn : new WorkspaceSubgraph(workspaceId, 0, List.of(), List.of());
        }
    }

    private static class FakeIngestUseCase implements IngestPerformanceFlowUseCase {
        PerformanceFlow lastIngestedFlow;

        @Override
        public void ingestFlow(PerformanceFlow flow) {
            this.lastIngestedFlow = flow;
        }
    }
}
