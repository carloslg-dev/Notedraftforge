package org.ndf.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.domain.model.flow.BranchNode;
import org.ndf.domain.model.flow.FlowEdge;
import org.ndf.domain.model.flow.PieceNode;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.domain.model.flow.WorkspaceNode;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PerformanceFlowTest {

    @Test
    @DisplayName("Should create and update a performance flow aggregate root")
    void shouldCreateAndUpdatePerformanceFlow() {
        PerformanceFlow flow = PerformanceFlow.createNew("flow-1", "Recital Primavera", "Concierto poético acústico");

        assertThat(flow.getId()).isEqualTo("flow-1");
        assertThat(flow.getTitle()).isEqualTo("Recital Primavera");
        assertThat(flow.getDescription()).isEqualTo("Concierto poético acústico");
        assertThat(flow.getNodes()).isEmpty();
        assertThat(flow.getEdges()).isEmpty();
        assertThat(flow.getRevision()).isEqualTo(0);

        PieceNode node1 = new PieceNode("n1", "piece-100");
        BranchNode node2 = new BranchNode("n2", "¿Repetir estribillo?");
        WorkspaceNode node3 = new WorkspaceNode("n3", "flow-sub-2");

        FlowEdge edge1 = FlowEdge.primary("e1", "n1", "n2");
        FlowEdge edge2 = FlowEdge.branch("e2", "n2", "n3", "Sí, con más fuerza");

        flow.updateStructure(List.of(node1, node2, node3), List.of(edge1, edge2));

        assertThat(flow.getRevision()).isEqualTo(1);
        assertThat(flow.getStructure().nodeCount()).isEqualTo(3);
        assertThat(flow.getStructure().edgeCount()).isEqualTo(2);
        assertThat(flow.getNodes().get(0)).isInstanceOf(PieceNode.class);
        assertThat(flow.getNodes().get(1)).isInstanceOf(BranchNode.class);
        assertThat(flow.getNodes().get(2)).isInstanceOf(WorkspaceNode.class);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when an edge connects non-existing nodes")
    void shouldThrowExceptionWhenEdgeIsDangling() {
        PieceNode node1 = new PieceNode("n1", "piece-100");
        FlowEdge danglingEdge = FlowEdge.primary("e1", "n1", "non-existing-node");

        assertThatThrownBy(() -> PerformanceFlow.createNew("flow-1", "Invalid Flow", null)
            .updateStructure(List.of(node1), List.of(danglingEdge)))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Edge targetNodeId 'non-existing-node' does not exist in nodes");
    }
}
