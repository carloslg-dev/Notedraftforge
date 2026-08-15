package org.ndf.domain.model.piece;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public record TextBlock(
    String id,
    String type, // "line", "paragraph", "heading"
    List<TextRun> runs
) {
    public TextBlock {
        Objects.requireNonNull(id, "TextBlock id cannot be null");
        type = type == null || type.isBlank() ? "line" : type;
        runs = runs == null ? Collections.emptyList() : List.copyOf(runs);
    }

    public String getPlainText() {
        StringBuilder sb = new StringBuilder();
        for (TextRun run : runs) {
            sb.append(run.text());
        }
        return sb.toString();
    }
}
