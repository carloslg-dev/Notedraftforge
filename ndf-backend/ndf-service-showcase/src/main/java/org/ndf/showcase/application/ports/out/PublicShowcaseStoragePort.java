package org.ndf.showcase.application.ports.out;

import org.ndf.contracts.showcase.model.PublicPieceDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;

import java.util.List;
import java.util.Optional;

public interface PublicShowcaseStoragePort {
    Optional<PublicPieceDTO> findPieceById(String pieceId);
    List<PublicPieceDTO> findAllPieces();
    Optional<PublicReadingSurfaceDTO> findReadingSurfaceByWorkspaceId(String workspaceId);
    void savePiece(PublicPieceDTO piece);
    void saveReadingSurface(PublicReadingSurfaceDTO surface);
}
