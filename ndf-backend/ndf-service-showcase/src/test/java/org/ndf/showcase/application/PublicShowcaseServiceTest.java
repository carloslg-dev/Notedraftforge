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
        piece.setId("piece-100");
        piece.setTitle("Cántico Espiritual");
        piece.setType("poem");
        storagePort.savePiece(piece);

        PublicPieceDTO result = service.getPublicPiece("piece-100");

        assertThat(result.getId()).isEqualTo("piece-100");
        assertThat(result.getTitle()).isEqualTo("Cántico Espiritual");
    }

    @Test
    @DisplayName("Should return fallback public piece when not found in storage")
    void shouldReturnFallbackPublicPiece() {
        PublicPieceDTO result = service.getPublicPiece("piece-missing");

        assertThat(result.getId()).isEqualTo("piece-missing");
        assertThat(result.getTitle()).contains("piece-missing");
    }

    @Test
    @DisplayName("Should list public pieces with pagination and filter")
    void shouldListPublicPieces() {
        PublicPieceDTO piece1 = new PublicPieceDTO();
        piece1.setId("p1");
        piece1.setType("poem");
        storagePort.savePiece(piece1);

        PublicPieceDTO piece2 = new PublicPieceDTO();
        piece2.setId("p2");
        piece2.setType("song");
        storagePort.savePiece(piece2);

        PublicPiecePageDTO poems = service.listPublicPieces("poem", 0, 10);
        assertThat(poems.getContent()).hasSize(1);
        assertThat(poems.getContent().get(0).getId()).isEqualTo("p1");
    }

    @Test
    @DisplayName("Should return reading surface for valid workspace")
    void shouldReturnReadingSurface() {
        PublicReadingSurfaceDTO surface = service.getReadingSurface("workspace-live");

        assertThat(surface.getWorkspaceId()).isEqualTo("workspace-live");
        assertThat(surface.getWorkspaceTitle()).contains("workspace-live");
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
