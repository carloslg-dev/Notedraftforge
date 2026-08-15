package org.ndf.domain.model.piece;

import java.util.Objects;

public record SongCell(
    String id,
    String lyric,
    String chord,
    String meter
) {
    public SongCell {
        Objects.requireNonNull(id, "SongCell id cannot be null");
        lyric = lyric == null ? "" : lyric;
    }
}
