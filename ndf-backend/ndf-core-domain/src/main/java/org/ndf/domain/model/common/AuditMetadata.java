package org.ndf.domain.model.common;

import java.time.Instant;

public record AuditMetadata(
        int revision,
        String createdAt,
        String updatedAt) {
    public AuditMetadata {
        revision = Math.max(0, revision);
        createdAt = createdAt == null || createdAt.isBlank() ? Instant.now().toString() : createdAt;
        updatedAt = updatedAt == null || updatedAt.isBlank() ? Instant.now().toString() : updatedAt;
    }

    public static AuditMetadata initial() {
        String now = Instant.now().toString();
        return new AuditMetadata(0, now, now);
    }

    public static AuditMetadata of(int revision, String createdAt, String updatedAt) {
        return new AuditMetadata(revision, createdAt, updatedAt);
    }

    public AuditMetadata nextRevision() {
        return new AuditMetadata(this.revision + 1, this.createdAt, Instant.now().toString());
    }

    public boolean isNewerThan(AuditMetadata other) {
        if (other == null) {
            return true;
        }
        return this.revision > other.revision;
    }
}
