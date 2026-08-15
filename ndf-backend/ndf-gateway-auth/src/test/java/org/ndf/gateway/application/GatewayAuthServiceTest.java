package org.ndf.gateway.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.gateway.application.ports.in.AuthenticateUserUseCase.AuthTokenResponse;
import org.ndf.gateway.application.ports.in.GetGatewayCatalogUseCase.RouteInfo;
import org.ndf.gateway.application.ports.out.TokenProviderPort;
import org.ndf.gateway.application.services.GatewayAuthService;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GatewayAuthServiceTest {

    private static final String ROLE_CREATOR = "creator";
    private static final String ROLE_ADMIN = "admin";
    private static final String DEFAULT_DEV_SUBJECT = "dev@notedraftforge.local";
    private static final String TOKEN_TYPE_BEARER = "Bearer";

    private GatewayAuthService service;

    @BeforeEach
    void setUp() {
        TokenProviderPort tokenProvider = new FakeTokenProvider();
        service = new GatewayAuthService(tokenProvider);
    }

    @Test
    @DisplayName("Should authenticate user and return Bearer token with creator role")
    void shouldAuthenticateUser() {
        AuthTokenResponse response = service.authenticate("alice", "secret123");

        assertThat(response.accessToken()).isEqualTo("mock-token-for-alice");
        assertThat(response.tokenType()).isEqualTo(TOKEN_TYPE_BEARER);
        assertThat(response.subject()).isEqualTo("alice");
        assertThat(response.roles()).containsExactly(ROLE_CREATOR);
        assertThat(response.expiresInSeconds()).isPositive();
    }

    @Test
    @DisplayName("Should generate dev token for custom subject and roles")
    void shouldGenerateDevToken() {
        AuthTokenResponse response = service.generateDevToken(DEFAULT_DEV_SUBJECT, Set.of(ROLE_ADMIN, ROLE_CREATOR));

        assertThat(response.accessToken()).isEqualTo("mock-token-for-" + DEFAULT_DEV_SUBJECT);
        assertThat(response.subject()).isEqualTo(DEFAULT_DEV_SUBJECT);
        assertThat(response.roles()).containsExactlyInAnyOrder(ROLE_ADMIN, ROLE_CREATOR);
    }

    @Test
    @DisplayName("Should return 4 registered satellite backend routes in the gateway catalog")
    void shouldReturnGatewayCatalogRoutes() {
        List<RouteInfo> routes = service.getRegisteredRoutes();

        assertThat(routes).hasSize(4);
        assertThat(routes).extracting("serviceId")
            .containsExactlyInAnyOrder(
                "ndf-service-sync-vault",
                "ndf-service-showcase",
                "ndf-service-graph-knowledge",
                "ndf-service-ai-gateway"
            );
    }

    @Test
    @DisplayName("Should throw NullPointerException when authenticating with null username or password")
    void shouldThrowExceptionOnNullCredentials() {
        assertThatThrownBy(() -> service.authenticate(null, "pass"))
            .isInstanceOf(NullPointerException.class);

        assertThatThrownBy(() -> service.authenticate("user", null))
            .isInstanceOf(NullPointerException.class);
    }

    private static class FakeTokenProvider implements TokenProviderPort {
        @Override
        public String issueToken(String subject, Set<String> roles, long durationSeconds) {
            return "mock-token-for-" + subject;
        }

        @Override
        public boolean validateToken(String token) {
            return token != null && !token.isBlank();
        }
    }
}
