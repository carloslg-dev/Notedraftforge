package org.ndf.domain.model.piece;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public record TextRun(
    String id,
    String text,
    List<String> marks
) {
    public TextRun {
        Objects.requireNonNull(id, "TextRun id cannot be null");
        Objects.requireNonNull(text, "TextRun text cannot be null");
        marks = marks == null ? Collections.emptyList() : List.copyOf(marks);
    }

    public static TextRun of(String id, String text) {
        return new TextRun(id, text, Collections.emptyList());
    }
}
