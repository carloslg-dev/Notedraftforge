package org.ndf.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.domain.model.piece.Piece;
import org.ndf.domain.model.piece.PieceContent;
import org.ndf.domain.model.piece.PieceMetadata;
import org.ndf.domain.model.piece.PieceType;
import org.ndf.domain.model.piece.TextBlock;
import org.ndf.domain.model.piece.TextRun;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PieceTest {

    @Test
    @DisplayName("Should create a new piece aggregate with initial revision 0")
    void shouldCreateNewPieceWithInitialRevisionZero() {
        Piece piece = Piece.createNew("piece-1", "Canto a la luna", PieceType.POEM, "es");

        assertThat(piece.getId()).isEqualTo("piece-1");
        assertThat(piece.getTitle()).isEqualTo("Canto a la luna");
        assertThat(piece.getType()).isEqualTo(PieceType.POEM);
        assertThat(piece.getLanguage()).isEqualTo("es");
        assertThat(piece.getRevision()).isEqualTo(0);
        assertThat(piece.getContent().isEmpty()).isTrue();
        assertThat(piece.getAudit().createdAt()).isNotNull();
    }

    @Test
    @DisplayName("Should increment revision monotonically when updating content")
    void shouldIncrementRevisionOnContentUpdate() {
        Piece piece = Piece.createNew("piece-1", "Poema 1", PieceType.POEM, "es");
        assertThat(piece.getRevision()).isEqualTo(0);

        TextBlock block = new TextBlock("b1", "line", List.of(TextRun.of("r1", "La noche estrellada")));
        piece.updateContent(PieceContent.ofText(List.of(block)));

        assertThat(piece.getRevision()).isEqualTo(1);
        assertThat(piece.getContent().textBlocks()).hasSize(1);
        assertThat(piece.getContent().getPlainText()).isEqualTo("La noche estrellada");
    }

    @Test
    @DisplayName("Should increment revision when updating metadata")
    void shouldIncrementRevisionOnMetadataUpdate() {
        Piece piece = Piece.createNew("piece-1", "Borrador", PieceType.TEXT, "es");
        assertThat(piece.getRevision()).isEqualTo(0);

        PieceMetadata newMeta = piece.getMetadata()
            .withTitle("Canción Final")
            .withType(PieceType.SONG)
            .withTags(List.of("acústico", "verano"));

        piece.updateMetadata(newMeta);

        assertThat(piece.getRevision()).isEqualTo(1);
        assertThat(piece.getTitle()).isEqualTo("Canción Final");
        assertThat(piece.getType()).isEqualTo(PieceType.SONG);
        assertThat(piece.getMetadata().tags()).containsExactly("acústico", "verano");
    }

    @Test
    @DisplayName("Should throw NullPointerException when Piece ID is null")
    void shouldThrowExceptionWhenIdIsNull() {
        assertThatThrownBy(() -> new Piece(null, null, null, null))
            .isInstanceOf(NullPointerException.class)
            .hasMessageContaining("Piece ID cannot be null");
    }
}
