package org.ndf.vault.infrastructure.adapters.out.postgres;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class VaultSnapshotPanacheRepository implements PanacheRepositoryBase<VaultSnapshotEntity, String> {

    public Optional<VaultSnapshotEntity> findLatestByUserId(String userId) {
        return find("userId = ?1 order by revision desc", userId).firstResultOptional();
    }
}
