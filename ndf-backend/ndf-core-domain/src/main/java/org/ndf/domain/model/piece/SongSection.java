package org.ndf.domain.model.piece;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

public record SongSection(
    String id,
    String sectionType, // "verse", "chorus", "bridge", "intro", "outro"
    List<SongCell> cells
) {
    public SongSection {
        Objects.requireNonNull(id, "SongSection id cannot be null");
        sectionType = sectionType == null || sectionType.isBlank() ? "verse" : sectionType;
        cells = cells == null ? Collections.emptyList() : List.copyOf(cells);
    }
}
