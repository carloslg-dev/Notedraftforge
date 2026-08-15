package org.ndf.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.domain.model.common.AuditMetadata;

import static org.assertj.core.api.Assertions.assertThat;

class AuditMetadataTest {

    @Test
    @DisplayName("Should initialize audit metadata with revision 0")
    void shouldInitializeWithZero() {
        AuditMetadata audit = AuditMetadata.initial();
        assertThat(audit.revision()).isEqualTo(0);
        assertThat(audit.createdAt()).isNotNull();
        assertThat(audit.updatedAt()).isEqualTo(audit.createdAt());
    }

    @Test
    @DisplayName("Should increment revision monotonically and update timestamp")
    void shouldIncrementRevisionMonotonically() {
        AuditMetadata audit = AuditMetadata.initial();
        AuditMetadata next = audit.nextRevision();

        assertThat(next.revision()).isEqualTo(1);
        assertThat(next.createdAt()).isEqualTo(audit.createdAt());
        assertThat(next.isNewerThan(audit)).isTrue();
        assertThat(audit.isNewerThan(next)).isFalse();
    }
}
