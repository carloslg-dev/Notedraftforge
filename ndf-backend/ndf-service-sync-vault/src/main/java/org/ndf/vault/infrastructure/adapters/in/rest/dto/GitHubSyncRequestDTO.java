package org.ndf.vault.infrastructure.adapters.in.rest.dto;

import org.ndf.domain.model.piece.Piece;
import org.ndf.domain.model.vault.VaultContent;

import java.util.Collections;
import java.util.List;

public record GitHubSyncRequestDTO(
    String userId,
    String repoOwner,
    String repoName,
    String branch,
    String personalAccessToken,
    String commitMessage,
    List<Piece> pieces
) {
    public GitHubSyncRequestDTO {
        pieces = pieces == null ? Collections.emptyList() : pieces;
    }

    public VaultContent toVaultContent() {
        return new VaultContent(pieces, Collections.emptyList(), Collections.emptyList());
    }
}
