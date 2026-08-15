package org.ndf.graph.application.ports.in;

import java.util.List;

public interface GetWorkspaceSubgraphUseCase {

    record GraphNodeInfo(
        String id,
        String type,
        String label
    ) {}

    record GraphEdgeInfo(
        String source,
        String target,
        String kind,
        String conditionLabel
    ) {}

    record WorkspaceSubgraph(
        String rootWorkspaceId,
        int totalNodes,
        List<GraphNodeInfo> nodes,
        List<GraphEdgeInfo> edges
    ) {}

    WorkspaceSubgraph getSubgraph(String workspaceId);
}
