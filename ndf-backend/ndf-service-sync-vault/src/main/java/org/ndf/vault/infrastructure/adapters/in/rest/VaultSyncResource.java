package org.ndf.vault.infrastructure.adapters.in.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ndf.contracts.vault.model.GitHubSyncRequestDTO;
import org.ndf.contracts.vault.model.PieceDTO;
import org.ndf.contracts.vault.model.SyncVaultRequest;
import org.ndf.contracts.vault.model.SyncVaultResponse;
import org.ndf.domain.model.common.AuditMetadata;
import org.ndf.domain.model.piece.Piece;
import org.ndf.domain.model.piece.PieceContent;
import org.ndf.domain.model.piece.PieceMetadata;
import org.ndf.domain.model.piece.PieceType;
import org.ndf.domain.model.vault.VaultContent;
import org.ndf.domain.model.vault.VaultSnapshot;
import org.ndf.vault.application.exceptions.RevisionConflictException;
import org.ndf.vault.application.ports.in.GetLatestVaultUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncCommand;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncResult;
import org.ndf.vault.application.ports.in.SyncVaultUseCase;
import org.ndf.vault.application.ports.in.SyncVaultUseCase.SyncCommand;
import org.ndf.vault.application.ports.in.SyncVaultUseCase.SyncResult;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Path("/api/v1/vault")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VaultSyncResource {

    private static final String KEY_ERROR = "error";
    private static final String KEY_MESSAGE = "message";
    private static final String KEY_SERVER_REVISION = "serverRevision";
    private static final String KEY_CLIENT_REVISION = "clientRevision";
    private static final String DEFAULT_BRANCH = "main";
    private static final String DEFAULT_LANGUAGE = "es";
    private static final String ANONYMOUS_USER = "anonymous-user";
    private static final String UNTITLED = "Untitled";

    private final SyncVaultUseCase syncVaultUseCase;
    private final GetLatestVaultUseCase getLatestVaultUseCase;
    private final SyncToGitHubUseCase syncToGitHubUseCase;

    @Inject
    public VaultSyncResource(
        SyncVaultUseCase syncVaultUseCase,
        GetLatestVaultUseCase getLatestVaultUseCase,
        SyncToGitHubUseCase syncToGitHubUseCase
    ) {
        this.syncVaultUseCase = Objects.requireNonNull(syncVaultUseCase);
        this.getLatestVaultUseCase = Objects.requireNonNull(getLatestVaultUseCase);
        this.syncToGitHubUseCase = Objects.requireNonNull(syncToGitHubUseCase);
    }

    @POST
    @Path("/sync")
    public Response syncVault(SyncVaultRequest request) {
        if (request == null || request.getUserId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "userId is required"))
                .build();
        }

        try {
            VaultContent content = mapToVaultContent(request.getPieces());
            SyncCommand cmd = new SyncCommand(
                request.getUserId(),
                request.getRevision() != null ? request.getRevision() : 0,
                content
            );
            SyncResult result = syncVaultUseCase.syncVault(cmd);
            SyncVaultResponse response = new SyncVaultResponse()
                .status(result.status())
                .revision(result.revision())
                .syncedAt(OffsetDateTime.parse(result.syncedAt()));

            return Response.ok(response).build();
        } catch (RevisionConflictException e) {
            return Response.status(Response.Status.CONFLICT)
                .entity(Map.of(
                    KEY_ERROR, "Revision conflict detected",
                    KEY_SERVER_REVISION, e.getServerRevision(),
                    KEY_CLIENT_REVISION, e.getClientRevision()
                ))
                .build();
        }
    }

    @GET
    @Path("/latest")
    public Response getLatestVault(@QueryParam("userId") String userId) {
        if (userId == null || userId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "userId query parameter is required"))
                .build();
        }

        Optional<VaultSnapshot> latestOpt = getLatestVaultUseCase.getLatestVault(userId);
        if (latestOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of(KEY_MESSAGE, "No vault snapshot found for user: " + userId))
                .build();
        }

        return Response.ok(latestOpt.get()).build();
    }

    @POST
    @Path("/git/sync")
    public Response syncToGitHub(GitHubSyncRequestDTO request) {
        if (request == null || request.getRepoOwner() == null || request.getRepoName() == null || request.getPersonalAccessToken() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "repoOwner, repoName, and personalAccessToken are required"))
                .build();
        }

        VaultContent content = VaultContent.empty();

        GitHubSyncCommand cmd = new GitHubSyncCommand(
            ANONYMOUS_USER,
            request.getRepoOwner(),
            request.getRepoName(),
            request.getBranch() != null ? request.getBranch() : DEFAULT_BRANCH,
            request.getPersonalAccessToken(),
            request.getCommitMessage(),
            content
        );

        GitHubSyncResult result = syncToGitHubUseCase.syncToGitHub(cmd);
        return Response.ok(result).build();
    }

    private VaultContent mapToVaultContent(List<PieceDTO> pieceDTOs) {
        if (pieceDTOs == null || pieceDTOs.isEmpty()) {
            return VaultContent.empty();
        }
        List<Piece> pieces = new ArrayList<>();
        for (PieceDTO dto : pieceDTOs) {
            pieces.add(toDomainPiece(dto));
        }
        return new VaultContent(pieces, Collections.emptyList(), Collections.emptyList());
    }

    private Piece toDomainPiece(PieceDTO dto) {
        AuditMetadata audit = new AuditMetadata(
            dto.getRevision() != null ? dto.getRevision() : 0,
            "now",
            "now"
        );
        PieceType type = PieceType.TEXT;
        if (dto.getType() != null) {
            if (dto.getType() == PieceDTO.TypeEnum.POEM) {
                type = PieceType.POEM;
            } else if (dto.getType() == PieceDTO.TypeEnum.SONG) {
                type = PieceType.SONG;
            }
        }
        PieceMetadata meta = new PieceMetadata(
            dto.getTitle() != null ? dto.getTitle() : UNTITLED,
            type,
            dto.getLanguage() != null ? dto.getLanguage() : DEFAULT_LANGUAGE,
            dto.getTags() != null ? dto.getTags() : Collections.emptyList()
        );
        PieceContent content = PieceContent.empty();
        String id = dto.getId() != null ? dto.getId() : UUID.randomUUID().toString();
        return new Piece(id, meta, content, audit);
    }
}
