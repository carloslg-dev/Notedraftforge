package org.ndf.gateway.infrastructure;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.gateway.application.ports.in.AuthenticateUserUseCase;
import org.ndf.gateway.application.ports.in.AuthenticateUserUseCase.AuthTokenResponse;
import org.ndf.gateway.infrastructure.adapters.in.rest.AuthResource;
import org.ndf.gateway.infrastructure.adapters.in.rest.AuthResource.DevTokenRequest;
import org.ndf.gateway.infrastructure.adapters.in.rest.AuthResource.LoginRequest;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class AuthResourceTest {

    private static final String ROLE_CREATOR = "creator";
    private static final String ROLE_ADMIN = "admin";
    private static final String TOKEN_TYPE_BEARER = "Bearer";

    private FakeAuthUseCase authUseCase;
    private AuthResource resource;

    @BeforeEach
    void setUp() {
        authUseCase = new FakeAuthUseCase();
        resource = new AuthResource(authUseCase);
    }

    @Test
    @DisplayName("Should return 200 OK with AuthTokenResponse on valid credentials")
    void shouldReturnTokenOnValidLogin() {
        authUseCase.tokenToReturn = new AuthTokenResponse("jwt-xyz", TOKEN_TYPE_BEARER, 3600L, "john", Set.of(ROLE_CREATOR));

        LoginRequest request = new LoginRequest("john", "password123");
        Response response = resource.login(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(AuthTokenResponse.class);
        AuthTokenResponse entity = (AuthTokenResponse) response.getEntity();
        assertThat(entity.accessToken()).isEqualTo("jwt-xyz");
        assertThat(entity.subject()).isEqualTo("john");
    }

    @Test
    @DisplayName("Should return 400 BAD REQUEST when login request has missing credentials")
    void shouldReturnBadRequestOnMissingCredentials() {
        LoginRequest request = new LoginRequest(null, "password123");
        Response response = resource.login(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.BAD_REQUEST.getStatusCode());
    }

    @Test
    @DisplayName("Should return 200 OK when generating developer token")
    void shouldGenerateDevToken() {
        authUseCase.tokenToReturn = new AuthTokenResponse("dev-jwt", TOKEN_TYPE_BEARER, 3600L, "dev@test", Set.of(ROLE_ADMIN));

        DevTokenRequest request = new DevTokenRequest("dev@test", Set.of(ROLE_ADMIN));
        Response response = resource.generateDevToken(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(AuthTokenResponse.class);
    }

    private static class FakeAuthUseCase implements AuthenticateUserUseCase {
        AuthTokenResponse tokenToReturn;

        @Override
        public AuthTokenResponse authenticate(String username, String password) {
            return tokenToReturn != null ? tokenToReturn : new AuthTokenResponse("token", TOKEN_TYPE_BEARER, 3600, username, Set.of(ROLE_CREATOR));
        }

        @Override
        public AuthTokenResponse generateDevToken(String subject, Set<String> roles) {
            return tokenToReturn != null ? tokenToReturn : new AuthTokenResponse("token", TOKEN_TYPE_BEARER, 3600, subject, roles);
        }
    }
}
