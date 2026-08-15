package org.ndf.showcase.infrastructure.adapters.in.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.DefaultValue;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ndf.contracts.showcase.model.PublicPiecePageDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;
import org.ndf.showcase.application.services.PublicShowcaseService;

import java.util.Map;
import java.util.Objects;

@Path("/api/v1/showcase")
@Produces(MediaType.APPLICATION_JSON)
public class PublicShowcaseResource {

    private static final String KEY_ERROR = "error";

    private final PublicShowcaseService showcaseService;

    @Inject
    public PublicShowcaseResource(PublicShowcaseService showcaseService) {
        this.showcaseService = Objects.requireNonNull(showcaseService, "showcaseService cannot be null");
    }

    @GET
    @Path("/pieces")
    public Response listPublicPieces(
        @QueryParam("type") String type,
        @QueryParam("page") @DefaultValue("0") int page,
        @QueryParam("size") @DefaultValue("10") int size
    ) {
        PublicPiecePageDTO pageDto = showcaseService.listPublicPieces(type, page, size);
        return Response.ok(pageDto).build();
    }

    @GET
    @Path("/workspaces/{id}/reading-surface")
    public Response getPublicReadingSurface(@PathParam("id") String workspaceId) {
        if (workspaceId == null || workspaceId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "id path parameter is required"))
                .build();
        }

        try {
            PublicReadingSurfaceDTO surface = showcaseService.getReadingSurface(workspaceId);
            return Response.ok(surface).build();
        } catch (IllegalArgumentException _) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Invalid workspaceId"))
                .build();
        }
    }
}
