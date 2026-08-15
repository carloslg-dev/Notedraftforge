package org.ndf.domain.model.flow;

import java.util.Objects;

public record FlowEdge(
    String id,
    String sourceNodeId,
    String targetNodeId,
    String label,
    boolean isPrimary
) {
    public FlowEdge {
        Objects.requireNonNull(id, "FlowEdge id cannot be null");
        Objects.requireNonNull(sourceNodeId, "FlowEdge sourceNodeId cannot be null");
        Objects.requireNonNull(targetNodeId, "FlowEdge targetNodeId cannot be null");
    }

    public static FlowEdge primary(String id, String sourceId, String targetId) {
        return new FlowEdge(id, sourceId, targetId, null, true);
    }

    public static FlowEdge branch(String id, String sourceId, String targetId, String label) {
        return new FlowEdge(id, sourceId, targetId, label, false);
    }
}
