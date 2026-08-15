package org.ndf.vault.infrastructure.adapters.in.rest.dto;

import org.ndf.domain.model.annotation.Annotation;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.domain.model.piece.Piece;
import org.ndf.domain.model.vault.VaultContent;

import java.util.Collections;
import java.util.List;

public record SyncRequestDTO(
    String userId,
    int revision,
    String targetMode, // cloud_postgres or sovereign_github
    List<Piece> pieces,
    List<Annotation> annotations,
    List<PerformanceFlow> workspaces
) {
    public SyncRequestDTO {
        pieces = pieces == null ? Collections.emptyList() : pieces;
        annotations = annotations == null ? Collections.emptyList() : annotations;
        workspaces = workspaces == null ? Collections.emptyList() : workspaces;
    }

    public VaultContent toVaultContent() {
        return new VaultContent(pieces, annotations, workspaces);
    }
}
