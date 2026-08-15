package org.ndf.domain.model.piece;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public record PieceMetadata(
    String title,
    PieceType type,
    String language,
    List<String> tags
) {
    public PieceMetadata {
        title = title == null || title.isBlank() ? "Untitled Piece" : title.trim();
        type = type == null ? PieceType.TEXT : type;
        language = language == null || language.isBlank() ? "es" : language.trim();
        tags = tags == null ? Collections.emptyList() : List.copyOf(tags);
    }

    public static PieceMetadata of(String title, PieceType type, String language) {
        return new PieceMetadata(title, type, language, Collections.emptyList());
    }

    public static PieceMetadata of(String title, PieceType type, String language, List<String> tags) {
        return new PieceMetadata(title, type, language, tags);
    }

    public static PieceMetadata empty() {
        return new PieceMetadata("Untitled Piece", PieceType.TEXT, "es", Collections.emptyList());
    }

    public PieceMetadata withTitle(String newTitle) {
        return new PieceMetadata(newTitle, this.type, this.language, this.tags);
    }

    public PieceMetadata withType(PieceType newType) {
        return new PieceMetadata(this.title, newType, this.language, this.tags);
    }

    public PieceMetadata withLanguage(String newLanguage) {
        return new PieceMetadata(this.title, this.type, newLanguage, this.tags);
    }

    public PieceMetadata withTags(List<String> newTags) {
        return new PieceMetadata(this.title, this.type, this.language, newTags);
    }
}
