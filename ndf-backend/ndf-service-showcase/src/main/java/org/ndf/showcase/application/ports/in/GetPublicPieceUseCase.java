package org.ndf.showcase.application.ports.in;

import org.ndf.contracts.showcase.model.PublicPieceDTO;

public interface GetPublicPieceUseCase {
    PublicPieceDTO getPublicPiece(String pieceId);
}
