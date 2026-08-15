package org.ndf.domain.model.flow;

import java.util.Objects;

public record PieceNode(
    String id,
    String pieceId
) implements FlowNode {
    public PieceNode {
        Objects.requireNonNull(id, "PieceNode id cannot be null");
        Objects.requireNonNull(pieceId, "PieceNode pieceId cannot be null");
    }

    @Override
    public String type() {
        return "piece";
    }
}
