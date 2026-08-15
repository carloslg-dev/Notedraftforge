package org.ndf.showcase.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.contracts.showcase.model.PublicPieceDTO;
import org.ndf.contracts.showcase.model.PublicPiecePageDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;
import org.ndf.showcase.application.services.PublicShowcaseService;
import org.ndf.showcase.infrastructure.adapters.out.memory.InMemoryShowcaseAdapter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PublicShowcaseServiceTest {

    private static final String PIECE_100 = "piece-100";
    private static final String PIECE_TITLE = "Cántico Espiritual";
    private static final String PIECE_MISSING = "piece-missing";
    private static final String TYPE_POEM = "poem";
    private static final String WORKSPACE_LIVE = "workspace-live";

    private InMemoryShowcaseAdapter storagePort;
    private PublicShowcaseService service;

    @BeforeEach
    void setUp() {
        storagePort = new InMemoryShowcaseAdapter();
        service = new PublicShowcaseService(storagePort);
    }

    @Test
    @DisplayName("Should return saved public piece when present in storage")
    void shouldReturnStoredPublicPiece() {
        PublicPieceDTO piece = new PublicPieceDTO();
        piece.setId(PIECE_100);
        piece.setTitle(PIECE_TITLE);
        piece.setType(TYPE_POEM);
        storagePort.savePiece(piece);

        PublicPieceDTO result = service.getPublicPiece(PIECE_100);

        assertThat(result.getId()).isEqualTo(PIECE_100);
        assertThat(result.getTitle()).isEqualTo(PIECE_TITLE);
    }

    @Test
    @DisplayName("Should return fallback public piece when not found in storage")
    void shouldReturnFallbackPublicPiece() {
        PublicPieceDTO result = service.getPublicPiece(PIECE_MISSING);

        assertThat(result.getId()).isEqualTo(PIECE_MISSING);
        assertThat(result.getTitle()).contains(PIECE_MISSING);
    }

    @Test
    @DisplayName("Should list public pieces with pagination and filter")
    void shouldListPublicPieces() {
        PublicPieceDTO piece1 = new PublicPieceDTO();
        piece1.setId("p1");
        piece1.setType(TYPE_POEM);
        storagePort.savePiece(piece1);

        PublicPieceDTO piece2 = new PublicPieceDTO();
        piece2.setId("p2");
        piece2.setType("song");
        storagePort.savePiece(piece2);

        PublicPieceDTO piece3 = new PublicPieceDTO();
        piece3.setId("p3");
        piece3.setType(TYPE_POEM);
        storagePort.savePiece(piece3);

        PublicPiecePageDTO firstPage = service.listPublicPieces(TYPE_POEM, 0, 1);
        assertThat(firstPage.getContent()).hasSize(1);
        assertThat(firstPage.getTotalPages()).isEqualTo(2);
        assertThat(firstPage.getTotalElements()).isEqualTo(2);

        PublicPiecePageDTO secondPage = service.listPublicPieces(TYPE_POEM, 1, 1);
        assertThat(secondPage.getContent()).hasSize(1);
        assertThat(secondPage.getContent().get(0).getId()).isNotEqualTo(firstPage.getContent().get(0).getId());
    }

    @Test
    @DisplayName("Should return reading surface for valid workspace")
    void shouldReturnReadingSurface() {
        PublicReadingSurfaceDTO surface = service.getReadingSurface(WORKSPACE_LIVE);

        assertThat(surface.getWorkspaceId()).isEqualTo(WORKSPACE_LIVE);
        assertThat(surface.getWorkspaceTitle()).contains(WORKSPACE_LIVE);
        assertThat(surface.getCompiledItems()).isNotEmpty();
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when pieceId or workspaceId is blank")
    void shouldThrowExceptionOnBlankIds() {
        assertThatThrownBy(() -> service.getPublicPiece(""))
            .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> service.getReadingSurface("  "))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
