package org.ndf.vault.infrastructure.adapters.in.rest.dto;

public record SyncResponseDTO(
    String status,
    int revision,
    String syncedAt
) {}
