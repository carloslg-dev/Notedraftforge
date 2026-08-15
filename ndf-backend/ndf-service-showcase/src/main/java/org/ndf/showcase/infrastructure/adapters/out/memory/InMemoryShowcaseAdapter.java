package org.ndf.showcase.infrastructure.adapters.out.memory;

import jakarta.enterprise.context.ApplicationScoped;
import org.ndf.contracts.showcase.model.PublicPieceDTO;
import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;
import org.ndf.showcase.application.ports.out.PublicShowcaseStoragePort;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@ApplicationScoped
public class InMemoryShowcaseAdapter implements PublicShowcaseStoragePort {

    private final Map<String, PublicPieceDTO> pieces = new ConcurrentHashMap<>();
    private final Map<String, PublicReadingSurfaceDTO> readingSurfaces = new ConcurrentHashMap<>();

    @Override
    public Optional<PublicPieceDTO> findPieceById(String pieceId) {
        return Optional.ofNullable(pieces.get(pieceId));
    }

    @Override
    public List<PublicPieceDTO> findAllPieces() {
        return new ArrayList<>(pieces.values());
    }

    @Override
    public Optional<PublicReadingSurfaceDTO> findReadingSurfaceByWorkspaceId(String workspaceId) {
        return Optional.ofNullable(readingSurfaces.get(workspaceId));
    }

    @Override
    public void savePiece(PublicPieceDTO piece) {
        if (piece != null && piece.getId() != null) {
            pieces.put(piece.getId(), piece);
        }
    }

    @Override
    public void saveReadingSurface(PublicReadingSurfaceDTO surface) {
        if (surface != null && surface.getWorkspaceId() != null) {
            readingSurfaces.put(surface.getWorkspaceId(), surface);
        }
    }
}
