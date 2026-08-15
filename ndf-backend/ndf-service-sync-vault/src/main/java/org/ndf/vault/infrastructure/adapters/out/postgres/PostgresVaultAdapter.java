package org.ndf.vault.infrastructure.adapters.out.postgres;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.ndf.domain.model.common.AuditMetadata;
import org.ndf.domain.model.vault.VaultContent;
import org.ndf.domain.model.vault.VaultSnapshot;
import org.ndf.vault.application.ports.out.VaultStoragePort;

import java.io.UncheckedIOException;
import java.util.Objects;
import java.util.Optional;

@ApplicationScoped
public class PostgresVaultAdapter implements VaultStoragePort {

    private final VaultSnapshotPanacheRepository repository;
    private final ObjectMapper objectMapper;

    @Inject
    public PostgresVaultAdapter(VaultSnapshotPanacheRepository repository, ObjectMapper objectMapper) {
        this.repository = Objects.requireNonNull(repository, "repository cannot be null");
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper cannot be null");
    }

    @Override
    public Optional<VaultSnapshot> findLatestByUserId(String userId) {
        return repository.findLatestByUserId(userId).map(this::toDomain);
    }

    @Override
    @Transactional
    public void save(VaultSnapshot snapshot) {
        VaultSnapshotEntity entity = toEntity(snapshot);
        repository.persist(entity);
    }

    private VaultSnapshot toDomain(VaultSnapshotEntity entity) {
        try {
            VaultContent content = objectMapper.readValue(entity.payloadJson, VaultContent.class);
            AuditMetadata audit = new AuditMetadata(entity.revision, entity.createdAt, entity.updatedAt);
            return new VaultSnapshot(entity.id, entity.userId, content, audit);
        } catch (JsonProcessingException e) {
            throw new UncheckedIOException("Failed to deserialize VaultContent from JSON payload", e);
        }
    }

    private VaultSnapshotEntity toEntity(VaultSnapshot snapshot) {
        try {
            VaultSnapshotEntity entity = new VaultSnapshotEntity();
            entity.id = snapshot.getId();
            entity.userId = snapshot.getUserId();
            entity.revision = snapshot.getRevision();
            entity.payloadJson = objectMapper.writeValueAsString(snapshot.getContent());
            entity.createdAt = snapshot.getAudit().createdAt();
            entity.updatedAt = snapshot.getAudit().updatedAt();
            return entity;
        } catch (JsonProcessingException e) {
            throw new UncheckedIOException("Failed to serialize VaultContent to JSON payload", e);
        }
    }
}
