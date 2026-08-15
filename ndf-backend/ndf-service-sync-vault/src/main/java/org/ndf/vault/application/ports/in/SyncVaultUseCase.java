package org.ndf.vault.application.ports.in;

import org.ndf.domain.model.vault.VaultContent;

public interface SyncVaultUseCase {

    record SyncCommand(
        String userId,
        int clientRevision,
        VaultContent content
    ) {}

    record SyncResult(
        String status,
        int revision,
        String syncedAt
    ) {}

    SyncResult syncVault(SyncCommand command);
}
