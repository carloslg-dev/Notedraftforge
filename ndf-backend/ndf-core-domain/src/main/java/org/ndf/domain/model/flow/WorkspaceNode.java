package org.ndf.domain.model.flow;

import java.util.Objects;

public record WorkspaceNode(
    String id,
    String workspaceId
) implements FlowNode {
    public WorkspaceNode {
        Objects.requireNonNull(id, "WorkspaceNode id cannot be null");
        Objects.requireNonNull(workspaceId, "WorkspaceNode workspaceId cannot be null");
    }

    @Override
    public String type() {
        return "workspace";
    }
}
