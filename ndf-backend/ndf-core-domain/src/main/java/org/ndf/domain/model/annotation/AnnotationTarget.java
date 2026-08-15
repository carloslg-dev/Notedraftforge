package org.ndf.domain.model.annotation;

import java.util.Objects;

public record AnnotationTarget(
    String kind, // "text-node", "text-range", "song-cell", "song-cell-range"
    String blockId,
    Integer startOffset,
    Integer endOffset,
    String cellId
) {
    public AnnotationTarget {
        Objects.requireNonNull(kind, "AnnotationTarget kind cannot be null");
    }

    public static AnnotationTarget forBlock(String blockId) {
        return new AnnotationTarget("text-node", blockId, null, null, null);
    }

    public static AnnotationTarget forRange(String blockId, int start, int end) {
        return new AnnotationTarget("text-range", blockId, start, end, null);
    }

    public static AnnotationTarget forSongCell(String cellId) {
        return new AnnotationTarget("song-cell", null, null, null, cellId);
    }
}
