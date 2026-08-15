package org.ndf.domain.model.piece;

import java.util.Collections;
import java.util.List;

public record PieceContent(
    List<TextBlock> textBlocks,
    List<SongSection> songSections
) {
    public PieceContent {
        textBlocks = textBlocks == null ? Collections.emptyList() : List.copyOf(textBlocks);
        songSections = songSections == null ? Collections.emptyList() : List.copyOf(songSections);
    }

    public static PieceContent empty() {
        return new PieceContent(Collections.emptyList(), Collections.emptyList());
    }

    public static PieceContent ofText(List<TextBlock> textBlocks) {
        return new PieceContent(textBlocks, Collections.emptyList());
    }

    public static PieceContent ofSong(List<SongSection> songSections) {
        return new PieceContent(Collections.emptyList(), songSections);
    }

    public boolean isEmpty() {
        return textBlocks.isEmpty() && songSections.isEmpty();
    }

    public String getPlainText() {
        StringBuilder sb = new StringBuilder();
        for (TextBlock block : textBlocks) {
            sb.append(block.getPlainText()).append("\n");
        }
        for (SongSection section : songSections) {
            for (SongCell cell : section.cells()) {
                sb.append(cell.lyric()).append(" ");
            }
            sb.append("\n");
        }
        return sb.toString().trim();
    }

    public int getLinesCount() {
        if (!textBlocks.isEmpty()) {
            return textBlocks.size();
        }
        int totalCells = 0;
        for (SongSection section : songSections) {
            totalCells += section.cells().size();
        }
        return totalCells;
    }
}
