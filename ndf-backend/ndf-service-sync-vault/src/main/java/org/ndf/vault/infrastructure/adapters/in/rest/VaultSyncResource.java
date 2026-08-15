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
import org.ndf.domain.model.vault.VaultSnapshot;
import org.ndf.vault.application.exceptions.RevisionConflictException;
import org.ndf.vault.application.ports.in.GetLatestVaultUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncCommand;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncResult;
import org.ndf.vault.application.ports.in.SyncVaultUseCase;
import org.ndf.vault.application.ports.in.SyncVaultUseCase.SyncCommand;
import org.ndf.vault.application.ports.in.SyncVaultUseCase.SyncResult;
import org.ndf.vault.infrastructure.adapters.in.rest.dto.GitHubSyncRequestDTO;
import org.ndf.vault.infrastructure.adapters.in.rest.dto.SyncRequestDTO;
import org.ndf.vault.infrastructure.adapters.in.rest.dto.SyncResponseDTO;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Path("/api/v1/vault")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class VaultSyncResource {

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
    public Response syncVault(SyncRequestDTO request) {
        if (request == null || request.userId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "userId is required"))
                .build();
        }

        try {
            SyncCommand cmd = new SyncCommand(request.userId(), request.revision(), request.toVaultContent());
            SyncResult result = syncVaultUseCase.syncVault(cmd);
            return Response.ok(new SyncResponseDTO(result.status(), result.revision(), result.syncedAt())).build();
        } catch (RevisionConflictException e) {
            return Response.status(Response.Status.CONFLICT)
                .entity(Map.of(
                    "error", "Revision conflict detected",
                    "serverRevision", e.getServerRevision(),
                    "clientRevision", e.getClientRevision()
                ))
                .build();
        }
    }

    @GET
    @Path("/latest")
    public Response getLatestVault(@QueryParam("userId") String userId) {
        if (userId == null || userId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "userId query parameter is required"))
                .build();
        }

        Optional<VaultSnapshot> latestOpt = getLatestVaultUseCase.getLatestVault(userId);
        if (latestOpt.isEmpty()) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(Map.of("message", "No vault snapshot found for user: " + userId))
                .build();
        }

        return Response.ok(latestOpt.get()).build();
    }

    @POST
    @Path("/git/sync")
    public Response syncToGitHub(GitHubSyncRequestDTO request) {
        if (request == null || request.repoOwner() == null || request.repoName() == null || request.personalAccessToken() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "repoOwner, repoName, and personalAccessToken are required"))
                .build();
        }

        GitHubSyncCommand cmd = new GitHubSyncCommand(
            request.userId() != null ? request.userId() : "anonymous-user",
            request.repoOwner(),
            request.repoName(),
            request.branch() != null ? request.branch() : "main",
            request.personalAccessToken(),
            request.commitMessage(),
            request.toVaultContent()
        );

        GitHubSyncResult result = syncToGitHubUseCase.syncToGitHub(cmd);
        return Response.ok(result).build();
    }
}
