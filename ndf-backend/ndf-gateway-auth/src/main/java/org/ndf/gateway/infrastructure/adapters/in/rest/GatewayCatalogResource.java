package org.ndf.gateway.infrastructure.adapters.in.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ndf.gateway.application.ports.in.GetGatewayCatalogUseCase;
import org.ndf.gateway.application.ports.in.GetGatewayCatalogUseCase.RouteInfo;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Path("/api/v1/gateway")
@Produces(MediaType.APPLICATION_JSON)
public class GatewayCatalogResource {

    private static final String KEY_STATUS = "status";
    private static final String KEY_TOTAL_ROUTES = "totalRoutes";
    private static final String KEY_ROUTES = "routes";
    private static final String STATUS_OPERATIONAL = "OPERATIONAL";

    private final GetGatewayCatalogUseCase catalogUseCase;

    @Inject
    public GatewayCatalogResource(GetGatewayCatalogUseCase catalogUseCase) {
        this.catalogUseCase = Objects.requireNonNull(catalogUseCase, "catalogUseCase cannot be null");
    }

    @GET
    @Path("/routes")
    public Response getRoutes() {
        List<RouteInfo> routes = catalogUseCase.getRegisteredRoutes();
        return Response.ok(Map.of(
            KEY_STATUS, STATUS_OPERATIONAL,
            KEY_TOTAL_ROUTES, routes.size(),
            KEY_ROUTES, routes
        )).build();
    }

    @GET
    @Path("/health-matrix")
    public Response getHealthMatrix() {
        List<RouteInfo> routes = catalogUseCase.getRegisteredRoutes();
        List<Map<String, Object>> matrix = routes.stream()
            .map(r -> Map.<String, Object>of(
                "serviceId", r.serviceId(),
                "pathPrefix", r.pathPrefix(),
                "targetUrl", r.targetUrl(),
                "status", "HEALTHY"
            ))
            .toList();

        return Response.ok(Map.of(
            KEY_STATUS, STATUS_OPERATIONAL,
            "services", matrix
        )).build();
    }
}
