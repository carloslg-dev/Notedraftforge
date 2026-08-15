package org.ndf.graph.application.ports.in;

import java.util.List;

public interface GetPieceTraceabilityUseCase {

    record TraceReference(
        String workspaceId,
        String workspaceTitle,
        String nodeType,
        String parentNodeId
    ) {}

    record PieceTraceability(
        String pieceId,
        int referenceCount,
        List<TraceReference> references
    ) {}

    PieceTraceability getTraceability(String pieceId);
}
