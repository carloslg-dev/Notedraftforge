package org.ndf.domain.model.piece;

public enum PieceType {
    TEXT("text"),
    POEM("poem"),
    SONG("song");

    private final String value;

    PieceType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PieceType fromValue(String value) {
        if (value == null) {
            return TEXT;
        }
        for (PieceType type : values()) {
            if (type.value.equalsIgnoreCase(value.trim())) {
                return type;
            }
        }
        return TEXT;
    }
}
