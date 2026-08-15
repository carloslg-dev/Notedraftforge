package org.ndf.domain.model.flow;

import java.util.Objects;

public record BranchNode(
    String id,
    String label
) implements FlowNode {
    public BranchNode {
        Objects.requireNonNull(id, "BranchNode id cannot be null");
        label = label == null ? "¿Decisión de recital?" : label;
    }

    @Override
    public String type() {
        return "branch";
    }
}
