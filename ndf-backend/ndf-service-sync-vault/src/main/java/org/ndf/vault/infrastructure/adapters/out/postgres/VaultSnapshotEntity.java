package org.ndf.vault.infrastructure.adapters.out.postgres;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "vault_snapshots")
public class VaultSnapshotEntity extends PanacheEntityBase {

    @Id
    @Column(name = "id", nullable = false, length = 64)
    public String id;

    @Column(name = "user_id", nullable = false, length = 64)
    public String userId;

    @Column(name = "revision", nullable = false)
    public int revision;

    @Column(name = "payload_json", nullable = false, columnDefinition = "TEXT")
    public String payloadJson;

    @Column(name = "created_at", nullable = false, length = 64)
    public String createdAt;

    @Column(name = "updated_at", nullable = false, length = 64)
    public String updatedAt;
}
