package org.ndf.gateway.application.ports.out;

import java.util.Set;

public interface TokenProviderPort {
    String issueToken(String subject, Set<String> roles, long durationSeconds);
    boolean validateToken(String token);
}
