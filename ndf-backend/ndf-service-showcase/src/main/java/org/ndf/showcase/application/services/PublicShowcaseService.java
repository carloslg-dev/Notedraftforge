package org.ndf.showcase.application.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.ndf.contracts.showcase.model.PublicPieceDTO;
import org.ndf.contracts.showcase.model.PublicPiecePageDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTOCompiledItemsInner;
import org.ndf.showcase.application.ports.in.GetPublicPieceUseCase;
import org.ndf.showcase.application.ports.in.GetPublicReadingSurfaceUseCase;
import org.ndf.showcase.application.ports.out.PublicShowcaseStoragePort;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@ApplicationScoped
public class PublicShowcaseService implements GetPublicPieceUseCase, GetPublicReadingSurfaceUseCase {

    private final PublicShowcaseStoragePort storagePort;

    @Inject
    public PublicShowcaseService(PublicShowcaseStoragePort storagePort) {
        this.storagePort = Objects.requireNonNull(storagePort, "storagePort cannot be null");
    }

    @Override
    public PublicPieceDTO getPublicPiece(String pieceId) {
        if (pieceId == null || pieceId.isBlank()) {
            throw new IllegalArgumentException("pieceId cannot be empty");
        }

        return storagePort.findPieceById(pieceId)
            .orElseGet(() -> createFallbackPublicPiece(pieceId));
    }

    public PublicPiecePageDTO listPublicPieces(String type, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = (size <= 0) ? 10 : size;

        List<PublicPieceDTO> all = storagePort.findAllPieces();
        List<PublicPieceDTO> filtered = (type != null && !type.isBlank())
            ? all.stream().filter(p -> type.equalsIgnoreCase(p.getType())).toList()
            : all;

        int totalElements = filtered.size();
        int totalPages = totalElements == 0 ? 1 : (int) Math.ceil((double) totalElements / safeSize);

        List<PublicPieceDTO> pagedContent = filtered.stream()
            .skip((long) safePage * safeSize)
            .limit(safeSize)
            .toList();

        PublicPiecePageDTO pageDto = new PublicPiecePageDTO();
        pageDto.setContent(pagedContent);
        pageDto.setPage(safePage);
        pageDto.setTotalPages(totalPages);
        pageDto.setTotalElements(totalElements);
        return pageDto;
    }

    @Override
    public PublicReadingSurfaceDTO getReadingSurface(String workspaceId) {
        if (workspaceId == null || workspaceId.isBlank()) {
            throw new IllegalArgumentException("workspaceId cannot be empty");
        }

        return storagePort.findReadingSurfaceByWorkspaceId(workspaceId)
            .orElseGet(() -> createFallbackReadingSurface(workspaceId));
    }

    private PublicPieceDTO createFallbackPublicPiece(String pieceId) {
        PublicPieceDTO dto = new PublicPieceDTO();
        dto.setId(pieceId);
        dto.setTitle("Obra Pública #" + pieceId);
        dto.setType("poem");
        dto.setLanguage("es");
        dto.setTags(Collections.emptyList());
        dto.setPublishedAt(OffsetDateTime.now(ZoneOffset.UTC));
        return dto;
    }

    private PublicReadingSurfaceDTO createFallbackReadingSurface(String workspaceId) {
        PublicReadingSurfaceDTO dto = new PublicReadingSurfaceDTO();
        dto.setWorkspaceId(workspaceId);
        dto.setWorkspaceTitle("Superficie de Lectura Pública — " + workspaceId);

        PublicReadingSurfaceDTOCompiledItemsInner item = new PublicReadingSurfaceDTOCompiledItemsInner();
        item.setPieceId("piece-sample");
        item.setPieceTitle("Muestra Soberana");
        item.setContent("Contenido continuo compilado para recital poético.");
        dto.setCompiledItems(List.of(item));

        return dto;
    }
}
