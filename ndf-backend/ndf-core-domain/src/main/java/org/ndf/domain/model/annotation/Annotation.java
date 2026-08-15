package org.ndf.domain.model.annotation;

import java.time.Instant;
import java.util.Objects;

public record Annotation(
    String id,
    String pieceId,
    AnnotationKind kind,
    AnnotationTarget target,
    String content,
    String createdAt,
    String updatedAt
) {
    public Annotation {
        Objects.requireNonNull(id, "Annotation id cannot be null");
        Objects.requireNonNull(pieceId, "Annotation pieceId cannot be null");
        Objects.requireNonNull(kind, "Annotation kind cannot be null");
        Objects.requireNonNull(target, "Annotation target cannot be null");
        content = content == null ? "" : content;
        createdAt = createdAt == null ? Instant.now().toString() : createdAt;
        updatedAt = updatedAt == null ? Instant.now().toString() : updatedAt;
    }

    public static Annotation create(String id, String pieceId, AnnotationKind kind, AnnotationTarget target, String content) {
        return new Annotation(id, pieceId, kind, target, content, Instant.now().toString(), Instant.now().toString());
    }
}
