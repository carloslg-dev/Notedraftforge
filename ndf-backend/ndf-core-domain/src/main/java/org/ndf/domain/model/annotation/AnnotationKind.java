package org.ndf.domain.model.annotation;

public enum AnnotationKind {
    BREATH("breath"),
    INTENT("intent"),
    COMMENT("comment");

    private final String value;

    AnnotationKind(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static AnnotationKind fromValue(String value) {
        if (value == null) {
            return COMMENT;
        }
        for (AnnotationKind kind : values()) {
            if (kind.value.equalsIgnoreCase(value.trim())) {
                return kind;
            }
        }
        return COMMENT;
    }
}
