package org.ndf.gateway.application.ports.in;

import java.util.List;

public interface GetGatewayCatalogUseCase {

    record RouteInfo(
        String serviceId,
        String pathPrefix,
        String targetUrl,
        String description,
        boolean requiresAuth
    ) {}

    List<RouteInfo> getRegisteredRoutes();
}
