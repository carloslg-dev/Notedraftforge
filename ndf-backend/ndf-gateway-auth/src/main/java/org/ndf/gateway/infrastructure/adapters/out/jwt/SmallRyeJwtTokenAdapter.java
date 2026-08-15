package org.ndf.gateway.infrastructure.adapters.out.jwt;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.ndf.gateway.application.ports.out.TokenProviderPort;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.Set;

@ApplicationScoped
public class SmallRyeJwtTokenAdapter implements TokenProviderPort {

    private static final String DEFAULT_ISSUER = "https://auth.notedraftforge.org";

    @ConfigProperty(name = "mp.jwt.verify.issuer", defaultValue = DEFAULT_ISSUER)
    String issuer;

    @Override
    public String issueToken(String subject, Set<String> roles, long durationSeconds) {
        Objects.requireNonNull(subject, "subject cannot be null");
        Set<String> safeRoles = roles != null ? roles : Set.of();

        return Jwt.issuer(issuer)
            .upn(subject)
            .subject(subject)
            .groups(safeRoles)
            .issuedAt(Instant.now())
            .expiresIn(Duration.ofSeconds(durationSeconds))
            .sign();
    }

    @Override
    public boolean validateToken(String token) {
        return token != null && !token.isBlank();
    }
}
