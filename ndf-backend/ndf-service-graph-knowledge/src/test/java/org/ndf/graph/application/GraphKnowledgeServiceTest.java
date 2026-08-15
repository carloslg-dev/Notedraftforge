package org.ndf.graph.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.domain.model.flow.BranchNode;
import org.ndf.domain.model.flow.FlowEdge;
import org.ndf.domain.model.flow.PieceNode;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.PieceTraceability;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.WorkspaceSubgraph;
import org.ndf.graph.application.services.GraphKnowledgeService;
import org.ndf.graph.infrastructure.adapters.out.memory.FileInMemoryGraphAdapter;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GraphKnowledgeServiceTest {

    private FileInMemoryGraphAdapter adapter;
    private GraphKnowledgeService service;

    @BeforeEach
    void setUp() {
        adapter = new FileInMemoryGraphAdapter();
        service = new GraphKnowledgeService(adapter);
    }

    @Test
    @DisplayName("Should ingest flow and find piece traceability across multiple workspaces")
    void shouldFindPieceTraceability() {
        PerformanceFlow ws1 = PerformanceFlow.createNew("ws-1", "Anthology 2026", "Spring Poems");
        ws1.updateStructure(List.of(new PieceNode("n1", "piece-poema-1")), List.of());
        service.ingestFlow(ws1);

        PerformanceFlow ws2 = PerformanceFlow.createNew("ws-2", "Recital Madrid", "Acoustic Recital");
        ws2.updateStructure(List.of(new PieceNode("n2", "piece-poema-1")), List.of());
        service.ingestFlow(ws2);

        PieceTraceability trace = service.getTraceability("piece-poema-1");

        assertThat(trace.pieceId()).isEqualTo("piece-poema-1");
        assertThat(trace.referenceCount()).isEqualTo(2);
        assertThat(trace.references()).extracting("workspaceId").containsExactlyInAnyOrder("ws-1", "ws-2");
        assertThat(trace.references()).extracting("workspaceTitle").containsExactlyInAnyOrder("Anthology 2026", "Recital Madrid");
    }

    @Test
    @DisplayName("Should extract complete workspace subgraph with nodes and edges")
    void shouldExtractWorkspaceSubgraph() {
        PerformanceFlow ws = PerformanceFlow.createNew("ws-10", "Concierto", "Setlist acústico");
        PieceNode node1 = new PieceNode("n1", "p1");
        BranchNode node2 = new BranchNode("n2", "¿Bis?");
        FlowEdge edge = FlowEdge.primary("e1", "n1", "n2");

        ws.updateStructure(List.of(node1, node2), List.of(edge));
        service.ingestFlow(ws);

        WorkspaceSubgraph subgraph = service.getSubgraph("ws-10");

        assertThat(subgraph.rootWorkspaceId()).isEqualTo("ws-10");
        assertThat(subgraph.totalNodes()).isEqualTo(2);
        assertThat(subgraph.nodes()).extracting("type").containsExactly("piece", "branch");
        assertThat(subgraph.edges()).hasSize(1);
        assertThat(subgraph.edges().get(0).source()).isEqualTo("n1");
        assertThat(subgraph.edges().get(0).target()).isEqualTo("n2");
    }

    @Test
    @DisplayName("Should return 0 references when piece is not referenced in any workspace")
    void shouldReturnEmptyTraceabilityForUnknownPiece() {
        PieceTraceability trace = service.getTraceability("unknown-piece");

        assertThat(trace.pieceId()).isEqualTo("unknown-piece");
        assertThat(trace.referenceCount()).isEqualTo(0);
        assertThat(trace.references()).isEmpty();
    }

    @Test
    @DisplayName("Should throw NullPointerException when pieceId or workspaceId is null")
    void shouldThrowExceptionOnNullInputs() {
        assertThatThrownBy(() -> service.getTraceability(null))
            .isInstanceOf(NullPointerException.class)
            .hasMessageContaining("pieceId cannot be null");

        assertThatThrownBy(() -> service.getSubgraph(null))
            .isInstanceOf(NullPointerException.class)
            .hasMessageContaining("workspaceId cannot be null");
    }
}
