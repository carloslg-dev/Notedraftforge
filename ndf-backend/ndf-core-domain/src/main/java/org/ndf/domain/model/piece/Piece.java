package org.ndf.domain.model.piece;

import org.ndf.domain.model.common.AuditMetadata;

import java.util.Objects;

/**
 * Piece is the Aggregate Root for creative writing pieces (poems, lyrics, texts).
 * Enforces revision monotonicity, metadata updates, and content structural integrity.
 */
public class Piece {
    private final String id;
    private PieceMetadata metadata;
    private PieceContent content;
    private AuditMetadata audit;

    public Piece(String id, PieceMetadata metadata, PieceContent content, AuditMetadata audit) {
        this.id = Objects.requireNonNull(id, "Piece ID cannot be null");
        this.metadata = metadata != null ? metadata : PieceMetadata.empty();
        this.content = content != null ? content : PieceContent.empty();
        this.audit = audit != null ? audit : AuditMetadata.initial();
    }

    public static Piece createNew(String id, String title, PieceType type, String language) {
        return new Piece(
            id,
            PieceMetadata.of(title, type, language),
            PieceContent.empty(),
            AuditMetadata.initial()
        );
    }

    public static Piece of(String id, PieceMetadata metadata, PieceContent content) {
        return new Piece(id, metadata, content, AuditMetadata.initial());
    }

    public void updateMetadata(PieceMetadata newMetadata) {
        this.metadata = Objects.requireNonNull(newMetadata, "PieceMetadata cannot be null");
        this.audit = this.audit.nextRevision();
    }

    public void updateContent(PieceContent newContent) {
        this.content = Objects.requireNonNull(newContent, "PieceContent cannot be null");
        this.audit = this.audit.nextRevision();
    }

    public String getId() {
        return id;
    }

    public PieceMetadata getMetadata() {
        return metadata;
    }

    public PieceContent getContent() {
        return content;
    }

    public AuditMetadata getAudit() {
        return audit;
    }

    // Convenience Delegations for Domain Querying
    public String getTitle() {
        return metadata.title();
    }

    public PieceType getType() {
        return metadata.type();
    }

    public String getLanguage() {
        return metadata.language();
    }

    public int getRevision() {
        return audit.revision();
    }
}
