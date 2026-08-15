package org.ndf.gateway.application.ports.in;

import java.util.Set;

public interface AuthenticateUserUseCase {

    record AuthTokenResponse(
        String accessToken,
        String tokenType,
        long expiresInSeconds,
        String subject,
        Set<String> roles
    ) {}

    AuthTokenResponse authenticate(String username, String password);
    AuthTokenResponse generateDevToken(String subject, Set<String> roles);
}
