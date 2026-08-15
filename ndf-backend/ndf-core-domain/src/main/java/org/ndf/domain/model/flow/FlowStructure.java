package org.ndf.domain.model.flow;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public record FlowStructure(
    List<FlowNode> nodes,
    List<FlowEdge> edges
) {
    public FlowStructure {
        nodes = nodes == null ? Collections.emptyList() : List.copyOf(nodes);
        edges = edges == null ? Collections.emptyList() : List.copyOf(edges);
        validateIntegrity(nodes, edges);
    }

    public static FlowStructure empty() {
        return new FlowStructure(Collections.emptyList(), Collections.emptyList());
    }

    public static FlowStructure of(List<FlowNode> nodes, List<FlowEdge> edges) {
        return new FlowStructure(nodes, edges);
    }

    private static void validateIntegrity(List<FlowNode> nodes, List<FlowEdge> edges) {
        Set<String> nodeIds = nodes.stream().map(FlowNode::id).collect(Collectors.toSet());
        for (FlowEdge edge : edges) {
            if (!nodeIds.contains(edge.sourceNodeId())) {
                throw new IllegalArgumentException("Edge sourceNodeId '" + edge.sourceNodeId() + "' does not exist in nodes");
            }
            if (!nodeIds.contains(edge.targetNodeId())) {
                throw new IllegalArgumentException("Edge targetNodeId '" + edge.targetNodeId() + "' does not exist in nodes");
            }
        }
    }

    public int nodeCount() {
        return nodes.size();
    }

    public int edgeCount() {
        return edges.size();
    }
}
