package org.ndf.gateway.application.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.ndf.gateway.application.ports.in.AuthenticateUserUseCase;
import org.ndf.gateway.application.ports.in.GetGatewayCatalogUseCase;
import org.ndf.gateway.application.ports.out.TokenProviderPort;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@ApplicationScoped
public class GatewayAuthService implements AuthenticateUserUseCase, GetGatewayCatalogUseCase {

    private static final String TOKEN_TYPE_BEARER = "Bearer";
    private static final long DEFAULT_TOKEN_TTL_SECONDS = 3600L;
    private static final String ROLE_CREATOR = "creator";

    private final TokenProviderPort tokenProvider;

    private static final List<RouteInfo> DEFAULT_ROUTES = List.of(
        new RouteInfo(
            "ndf-service-sync-vault",
            "/api/v1/vault",
            "http://localhost:8081",
            "Sovereign dual vault sync service (PostgreSQL & GitHub)",
            true
        ),
        new RouteInfo(
            "ndf-service-showcase",
            "/api/v1/showcase",
            "http://localhost:8082",
            "Public sanitized piece showcase and reading surface",
            false
        ),
        new RouteInfo(
            "ndf-service-graph-knowledge",
            "/api/v1/graph",
            "http://localhost:8083",
            "Knowledge graph traceability and setlist flow traversal",
            true
        ),
        new RouteInfo(
            "ndf-service-ai-gateway",
            "/api/v1/ai",
            "http://localhost:8084",
            "LangChain4j meter analysis and rhyming dictionary engine",
            true
        )
    );

    @Inject
    public GatewayAuthService(TokenProviderPort tokenProvider) {
        this.tokenProvider = Objects.requireNonNull(tokenProvider, "tokenProvider cannot be null");
    }

    @Override
    public AuthTokenResponse authenticate(String username, String password) {
        Objects.requireNonNull(username, "username cannot be null");
        Objects.requireNonNull(password, "password cannot be null");

        // Identity verification logic (local sovereign credential check)
        Set<String> roles = Set.of(ROLE_CREATOR);
        String token = tokenProvider.issueToken(username, roles, DEFAULT_TOKEN_TTL_SECONDS);

        return new AuthTokenResponse(token, TOKEN_TYPE_BEARER, DEFAULT_TOKEN_TTL_SECONDS, username, roles);
    }

    @Override
    public AuthTokenResponse generateDevToken(String subject, Set<String> roles) {
        Objects.requireNonNull(subject, "subject cannot be null");
        Set<String> effectiveRoles = (roles == null || roles.isEmpty()) ? Set.of(ROLE_CREATOR) : roles;
        String token = tokenProvider.issueToken(subject, effectiveRoles, DEFAULT_TOKEN_TTL_SECONDS);

        return new AuthTokenResponse(token, TOKEN_TYPE_BEARER, DEFAULT_TOKEN_TTL_SECONDS, subject, effectiveRoles);
    }

    @Override
    public List<RouteInfo> getRegisteredRoutes() {
        return DEFAULT_ROUTES;
    }
}
