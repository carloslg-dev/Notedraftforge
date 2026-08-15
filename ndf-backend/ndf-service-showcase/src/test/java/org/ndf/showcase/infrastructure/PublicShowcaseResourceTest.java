package org.ndf.showcase.infrastructure;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.contracts.showcase.model.PublicPiecePageDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;
import org.ndf.showcase.application.services.PublicShowcaseService;
import org.ndf.showcase.infrastructure.adapters.in.rest.PublicShowcaseResource;
import org.ndf.showcase.infrastructure.adapters.out.memory.InMemoryShowcaseAdapter;

import static org.assertj.core.api.Assertions.assertThat;

class PublicShowcaseResourceTest {

    private static final String WORKSPACE_ID = "ws-main";

    private PublicShowcaseResource resource;

    @BeforeEach
    void setUp() {
        InMemoryShowcaseAdapter adapter = new InMemoryShowcaseAdapter();
        PublicShowcaseService service = new PublicShowcaseService(adapter);
        resource = new PublicShowcaseResource(service);
    }

    @Test
    @DisplayName("Should return 200 OK with PublicPiecePageDTO on listing pieces")
    void shouldListPublicPieces() {
        Response response = resource.listPublicPieces("poem", 0, 10);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(PublicPiecePageDTO.class);
    }

    @Test
    @DisplayName("Should return 200 OK with PublicReadingSurfaceDTO on valid workspaceId")
    void shouldReturnReadingSurfaceOnValidWorkspaceId() {
        Response response = resource.getPublicReadingSurface(WORKSPACE_ID);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(PublicReadingSurfaceDTO.class);
        PublicReadingSurfaceDTO entity = (PublicReadingSurfaceDTO) response.getEntity();
        assertThat(entity.getWorkspaceId()).isEqualTo(WORKSPACE_ID);
    }

    @Test
    @DisplayName("Should return 400 BAD REQUEST when workspaceId is blank or null")
    void shouldReturnBadRequestOnMissingWorkspaceId() {
        Response response = resource.getPublicReadingSurface(null);

        assertThat(response.getStatus()).isEqualTo(Response.Status.BAD_REQUEST.getStatusCode());
    }
}
