package org.ndf.domain.model.flow;

import java.util.Collections;
import java.util.List;

public record FlowMetadata(
    String title,
    String description,
    List<String> tags
) {
    public FlowMetadata {
        title = title == null || title.isBlank() ? "Untitled Workspace" : title.trim();
        tags = tags == null ? Collections.emptyList() : List.copyOf(tags);
    }

    public static FlowMetadata of(String title, String description) {
        return new FlowMetadata(title, description, Collections.emptyList());
    }

    public static FlowMetadata of(String title, String description, List<String> tags) {
        return new FlowMetadata(title, description, tags);
    }

    public static FlowMetadata empty() {
        return new FlowMetadata("Untitled Workspace", null, Collections.emptyList());
    }
}
