package org.ndf.domain.model.vault;

import org.ndf.domain.model.annotation.Annotation;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.domain.model.piece.Piece;

import java.util.Collections;
import java.util.List;

public record VaultContent(
    List<Piece> pieces,
    List<Annotation> annotations,
    List<PerformanceFlow> workspaces
) {
    public VaultContent {
        pieces = pieces == null ? Collections.emptyList() : List.copyOf(pieces);
        annotations = annotations == null ? Collections.emptyList() : List.copyOf(annotations);
        workspaces = workspaces == null ? Collections.emptyList() : List.copyOf(workspaces);
    }

    public static VaultContent empty() {
        return new VaultContent(Collections.emptyList(), Collections.emptyList(), Collections.emptyList());
    }

    public static VaultContent of(List<Piece> pieces, List<Annotation> annotations, List<PerformanceFlow> workspaces) {
        return new VaultContent(pieces, annotations, workspaces);
    }

    public int pieceCount() {
        return pieces.size();
    }

    public int annotationCount() {
        return annotations.size();
    }

    public int workspaceCount() {
        return workspaces.size();
    }
}
