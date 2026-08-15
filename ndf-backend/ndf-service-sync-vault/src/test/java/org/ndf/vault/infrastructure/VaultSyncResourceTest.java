package org.ndf.vault.infrastructure;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.contracts.vault.model.GitHubSyncRequestDTO;
import org.ndf.contracts.vault.model.SyncVaultRequest;
import org.ndf.contracts.vault.model.SyncVaultResponse;
import org.ndf.domain.model.common.AuditMetadata;
import org.ndf.domain.model.vault.VaultContent;
import org.ndf.domain.model.vault.VaultSnapshot;
import org.ndf.vault.application.exceptions.RevisionConflictException;
import org.ndf.vault.application.ports.in.GetLatestVaultUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncResult;
import org.ndf.vault.application.ports.in.SyncVaultUseCase;
import org.ndf.vault.infrastructure.adapters.in.rest.VaultSyncResource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class VaultSyncResourceTest {

    private FakeSyncVaultUseCase syncVaultUseCase;
    private FakeGetLatestVaultUseCase getLatestVaultUseCase;
    private FakeSyncToGitHubUseCase syncToGitHubUseCase;
    private VaultSyncResource resource;

    @BeforeEach
    void setUp() {
        syncVaultUseCase = new FakeSyncVaultUseCase();
        getLatestVaultUseCase = new FakeGetLatestVaultUseCase();
        syncToGitHubUseCase = new FakeSyncToGitHubUseCase();
        resource = new VaultSyncResource(syncVaultUseCase, getLatestVaultUseCase, syncToGitHubUseCase);
    }

    @Test
    @DisplayName("Should return 200 OK with SyncVaultResponse when sync succeeds")
    void shouldReturnOkOnSyncSuccess() {
        syncVaultUseCase.resultToReturn = new SyncVaultUseCase.SyncResult("SYNCHRONIZED", 5, "2026-08-15T12:00:00Z");

        SyncVaultRequest request = new SyncVaultRequest("user-1", 4, List.of());
        Response response = resource.syncVault(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(SyncVaultResponse.class);
        SyncVaultResponse dto = (SyncVaultResponse) response.getEntity();
        assertThat(dto.getStatus()).isEqualTo("SYNCHRONIZED");
        assertThat(dto.getRevision()).isEqualTo(5);
    }

    @Test
    @DisplayName("Should return 409 CONFLICT when revision is outdated")
    void shouldReturnConflictOnOutdatedRevision() {
        syncVaultUseCase.exceptionToThrow = new RevisionConflictException("Stale revision", 10, 4);

        SyncVaultRequest request = new SyncVaultRequest("user-1", 4, List.of());
        Response response = resource.syncVault(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.CONFLICT.getStatusCode());
    }

    @Test
    @DisplayName("Should return 200 OK with latest snapshot when user exists")
    void shouldReturnLatestSnapshot() {
        VaultSnapshot snapshot = new VaultSnapshot("s1", "u1", VaultContent.empty(), new AuditMetadata(2, "t1", "t2"));
        getLatestVaultUseCase.snapshotToReturn = snapshot;

        Response response = resource.getLatestVault("u1");

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isEqualTo(snapshot);
    }

    @Test
    @DisplayName("Should return 404 NOT FOUND when user has no snapshots")
    void shouldReturnNotFoundWhenNoSnapshot() {
        getLatestVaultUseCase.snapshotToReturn = null;

        Response response = resource.getLatestVault("u-unknown");

        assertThat(response.getStatus()).isEqualTo(Response.Status.NOT_FOUND.getStatusCode());
    }

    @Test
    @DisplayName("Should return 200 OK with GitHubSyncResult when sovereign git sync succeeds")
    void shouldReturnOkOnGitHubSyncSuccess() {
        syncToGitHubUseCase.resultToReturn = new GitHubSyncResult("sha-xyz", "https://github.com/u/repo/commit/sha-xyz", 1, "2026-08-15T12:00:00Z");

        GitHubSyncRequestDTO request = new GitHubSyncRequestDTO("owner", "repo", "main", "token");
        Response response = resource.syncToGitHub(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(GitHubSyncResult.class);
        GitHubSyncResult result = (GitHubSyncResult) response.getEntity();
        assertThat(result.commitSha()).isEqualTo("sha-xyz");
        assertThat(result.filesCommitted()).isEqualTo(1);
    }

    private static class FakeSyncVaultUseCase implements SyncVaultUseCase {
        SyncResult resultToReturn;
        RuntimeException exceptionToThrow;

        @Override
        public SyncResult syncVault(SyncCommand command) {
            if (exceptionToThrow != null) {
                throw exceptionToThrow;
            }
            return resultToReturn;
        }
    }

    private static class FakeGetLatestVaultUseCase implements GetLatestVaultUseCase {
        VaultSnapshot snapshotToReturn;

        @Override
        public Optional<VaultSnapshot> getLatestVault(String userId) {
            return Optional.ofNullable(snapshotToReturn);
        }
    }

    private static class FakeSyncToGitHubUseCase implements SyncToGitHubUseCase {
        GitHubSyncResult resultToReturn;

        @Override
        public GitHubSyncResult syncToGitHub(GitHubSyncCommand command) {
            return resultToReturn != null ? resultToReturn : new GitHubSyncResult("sha", "url", 1, "now");
        }
    }
}
