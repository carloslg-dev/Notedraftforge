package org.ndf.vault.application.ports.in;

import org.ndf.domain.model.vault.VaultSnapshot;

import java.util.Optional;

public interface GetLatestVaultUseCase {
    Optional<VaultSnapshot> getLatestVault(String userId);
}
