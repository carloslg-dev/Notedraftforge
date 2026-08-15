package org.ndf.domain.model.vault;

import org.ndf.domain.model.common.AuditMetadata;

import java.util.Objects;

/**
 * VaultSnapshot is the Aggregate Root for a user's cloud / Git backup storage.
 * Encapsulates the entire vault state and revision concurrency boundary.
 */
public class VaultSnapshot {
    private final String id;
    private final String userId;
    private VaultContent content;
    private AuditMetadata audit;

    public VaultSnapshot(String id, String userId, VaultContent content, AuditMetadata audit) {
        this.id = Objects.requireNonNull(id, "VaultSnapshot id cannot be null");
        this.userId = Objects.requireNonNull(userId, "VaultSnapshot userId cannot be null");
        this.content = content != null ? content : VaultContent.empty();
        this.audit = audit != null ? audit : AuditMetadata.initial();
    }

    public static VaultSnapshot createNew(String id, String userId) {
        return new VaultSnapshot(id, userId, VaultContent.empty(), AuditMetadata.initial());
    }

    public static VaultSnapshot of(String id, String userId, VaultContent content, AuditMetadata audit) {
        return new VaultSnapshot(id, userId, content, audit);
    }

    public void updateContent(VaultContent newContent) {
        this.content = Objects.requireNonNull(newContent, "VaultContent cannot be null");
        this.audit = this.audit.nextRevision();
    }

    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public VaultContent getContent() {
        return content;
    }

    public AuditMetadata getAudit() {
        return audit;
    }

    public int getRevision() {
        return audit.revision();
    }
}
