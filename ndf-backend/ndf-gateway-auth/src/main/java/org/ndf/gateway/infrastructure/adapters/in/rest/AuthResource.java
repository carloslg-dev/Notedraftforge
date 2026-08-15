package org.ndf.gateway.infrastructure.adapters.in.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ndf.gateway.application.ports.in.AuthenticateUserUseCase;
import org.ndf.gateway.application.ports.in.AuthenticateUserUseCase.AuthTokenResponse;

import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Path("/api/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    private static final String KEY_ERROR = "error";
    private static final String DEFAULT_DEV_SUBJECT = "developer@notedraftforge.local";
    private static final String ROLE_CREATOR = "creator";

    private final AuthenticateUserUseCase authUseCase;

    @Inject
    public AuthResource(AuthenticateUserUseCase authUseCase) {
        this.authUseCase = Objects.requireNonNull(authUseCase, "authUseCase cannot be null");
    }

    public record LoginRequest(String username, String password) {}
    public record DevTokenRequest(String subject, Set<String> roles) {}

    @POST
    @Path("/token")
    public Response login(LoginRequest request) {
        if (request == null || request.username() == null || request.password() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Username and password are required"))
                .build();
        }

        AuthTokenResponse token = authUseCase.authenticate(request.username(), request.password());
        return Response.ok(token).build();
    }

    @POST
    @Path("/dev-token")
    public Response generateDevToken(DevTokenRequest request) {
        String subject = (request != null && request.subject() != null && !request.subject().isBlank())
            ? request.subject()
            : DEFAULT_DEV_SUBJECT;

        Set<String> roles = (request != null && request.roles() != null)
            ? request.roles()
            : Set.of(ROLE_CREATOR);

        AuthTokenResponse token = authUseCase.generateDevToken(subject, roles);
        return Response.ok(token).build();
    }
}
