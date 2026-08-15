package org.ndf.vault.application.ports.out;

import org.ndf.domain.model.vault.VaultSnapshot;

import java.util.Optional;

public interface VaultStoragePort {
    Optional<VaultSnapshot> findLatestByUserId(String userId);
    void save(VaultSnapshot snapshot);
}
