package org.ndf.domain.model.flow;

public sealed interface FlowNode permits PieceNode, WorkspaceNode, BranchNode {
    String id();
    String type();
}
