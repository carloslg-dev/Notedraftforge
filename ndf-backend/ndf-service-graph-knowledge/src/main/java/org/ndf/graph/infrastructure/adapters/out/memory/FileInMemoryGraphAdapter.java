package org.ndf.graph.infrastructure.adapters.out.memory;

import jakarta.enterprise.context.ApplicationScoped;
import org.ndf.domain.model.flow.BranchNode;
import org.ndf.domain.model.flow.FlowEdge;
import org.ndf.domain.model.flow.FlowNode;
import org.ndf.domain.model.flow.PieceNode;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.domain.model.flow.WorkspaceNode;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.PieceTraceability;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.TraceReference;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.GraphEdgeInfo;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.GraphNodeInfo;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.WorkspaceSubgraph;
import org.ndf.graph.application.ports.out.GraphStoragePort;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class FileInMemoryGraphAdapter implements GraphStoragePort {

    private final Map<String, PerformanceFlow> flowsById = new ConcurrentHashMap<>();

    @Override
    public void storeFlow(PerformanceFlow flow) {
        if (flow != null && flow.getId() != null) {
            flowsById.put(flow.getId(), flow);
        }
    }

    @Override
    public PieceTraceability findPieceTraceability(String pieceId) {
        List<TraceReference> references = new ArrayList<>();

        for (PerformanceFlow flow : flowsById.values()) {
            for (FlowNode node : flow.getNodes()) {
                if (node instanceof PieceNode pn && pn.pieceId().equals(pieceId)) {
                    references.add(new TraceReference(
                        flow.getId(),
                        flow.getTitle(),
                        "piece",
                        null
                    ));
                }
            }
        }

        return new PieceTraceability(pieceId, references.size(), references);
    }

    @Override
    public WorkspaceSubgraph findWorkspaceSubgraph(String workspaceId) {
        PerformanceFlow flow = flowsById.get(workspaceId);
        if (flow == null) {
            return new WorkspaceSubgraph(workspaceId, 0, Collections.emptyList(), Collections.emptyList());
        }

        List<GraphNodeInfo> nodes = new ArrayList<>();
        for (FlowNode node : flow.getNodes()) {
            String type = node.type();
            String label = switch (node) {
                case PieceNode pn -> "Piece: " + pn.pieceId();
                case WorkspaceNode wn -> "Workspace: " + wn.workspaceId();
                case BranchNode bn -> bn.label();
            };
            nodes.add(new GraphNodeInfo(node.id(), type, label));
        }

        List<GraphEdgeInfo> edges = new ArrayList<>();
        for (FlowEdge edge : flow.getEdges()) {
            String kind = edge.isPrimary() ? "primary" : "branch";
            edges.add(new GraphEdgeInfo(
                edge.sourceNodeId(),
                edge.targetNodeId(),
                kind,
                edge.label()
            ));
        }

        return new WorkspaceSubgraph(workspaceId, nodes.size(), nodes, edges);
    }

    public void clear() {
        flowsById.clear();
    }
}
