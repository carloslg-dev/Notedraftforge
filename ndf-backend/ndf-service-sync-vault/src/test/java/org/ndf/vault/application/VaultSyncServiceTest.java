package org.ndf.vault.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.domain.model.common.AuditMetadata;
import org.ndf.domain.model.piece.Piece;
import org.ndf.domain.model.piece.PieceType;
import org.ndf.domain.model.vault.VaultContent;
import org.ndf.domain.model.vault.VaultSnapshot;
import org.ndf.vault.application.exceptions.RevisionConflictException;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncCommand;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncResult;
import org.ndf.vault.application.ports.in.SyncVaultUseCase.SyncCommand;
import org.ndf.vault.application.ports.in.SyncVaultUseCase.SyncResult;
import org.ndf.vault.application.ports.out.GitHubSyncPort;
import org.ndf.vault.application.ports.out.VaultStoragePort;
import org.ndf.vault.application.services.VaultSyncService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class VaultSyncServiceTest {

    private InMemoryVaultStorage storagePort;
    private InMemoryGitHubSync gitHubPort;
    private VaultSyncService service;

    @BeforeEach
    void setUp() {
        storagePort = new InMemoryVaultStorage();
        gitHubPort = new InMemoryGitHubSync();
        service = new VaultSyncService(storagePort, gitHubPort);
    }

    @Test
    @DisplayName("Should initialize first sync with revision 0 when no prior snapshot exists")
    void shouldInitializeFirstSync() {
        Piece piece = Piece.createNew("p-1", "Primer Poema", PieceType.POEM, "es");
        VaultContent content = VaultContent.of(List.of(piece), List.of(), List.of());

        SyncResult result = service.syncVault(new SyncCommand("user-1", 0, content));

        assertThat(result.status()).isEqualTo("SYNCHRONIZED");
        assertThat(result.revision()).isEqualTo(0);
        assertThat(storagePort.savedSnapshot).isNotNull();
        assertThat(storagePort.savedSnapshot.getUserId()).isEqualTo("user-1");
        assertThat(storagePort.savedSnapshot.getRevision()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should increment revision monotonically on subsequent sync")
    void shouldIncrementRevisionOnSubsequentSync() {
        VaultSnapshot existing = new VaultSnapshot("snap-1", "user-1", VaultContent.empty(), new AuditMetadata(3, "t1", "t2"));
        storagePort.existingSnapshot = existing;

        SyncResult result = service.syncVault(new SyncCommand("user-1", 3, VaultContent.empty()));

        assertThat(result.status()).isEqualTo("SYNCHRONIZED");
        assertThat(result.revision()).isEqualTo(4);
        assertThat(storagePort.savedSnapshot.getRevision()).isEqualTo(4);
    }

    @Test
    @DisplayName("Should reject sync and throw RevisionConflictException when client revision is stale")
    void shouldRejectStaleClientRevision() {
        VaultSnapshot existing = new VaultSnapshot("snap-1", "user-1", VaultContent.empty(), new AuditMetadata(5, "t1", "t2"));
        storagePort.existingSnapshot = existing;

        assertThatThrownBy(() -> service.syncVault(new SyncCommand("user-1", 2, VaultContent.empty())))
            .isInstanceOf(RevisionConflictException.class)
            .hasMessageContaining("Client revision 2 is stale compared to server revision 5");
    }

    @Test
    @DisplayName("Should format pieces into Markdown with YAML Frontmatter for sovereign GitHub sync")
    void shouldFormatMarkdownWithFrontmatterForGitHub() {
        Piece piece = Piece.createNew("p-10", "Canto del Viento", PieceType.POEM, "es");
        VaultContent content = VaultContent.of(List.of(piece), List.of(), List.of());

        GitHubSyncCommand cmd = new GitHubSyncCommand("u1", "poet", "vault", "main", "token-123", "sync works", content);
        GitHubSyncResult result = service.syncToGitHub(cmd);

        assertThat(result.commitSha()).isEqualTo("fake-sha-123");
        assertThat(result.filesCommitted()).isEqualTo(1);
        assertThat(gitHubPort.lastCommittedFiles).containsKey("pieces/poem/p-10_canto-del-viento.md");

        String mdContent = gitHubPort.lastCommittedFiles.get("pieces/poem/p-10_canto-del-viento.md");
        assertThat(mdContent).contains("---");
        assertThat(mdContent).contains("id: \"p-10\"");
        assertThat(mdContent).contains("title: \"Canto del Viento\"");
        assertThat(mdContent).contains("type: \"poem\"");
    }

    private static class InMemoryVaultStorage implements VaultStoragePort {
        VaultSnapshot existingSnapshot;
        VaultSnapshot savedSnapshot;

        @Override
        public Optional<VaultSnapshot> findLatestByUserId(String userId) {
            return Optional.ofNullable(existingSnapshot);
        }

        @Override
        public void save(VaultSnapshot snapshot) {
            this.savedSnapshot = snapshot;
            this.existingSnapshot = snapshot;
        }
    }

    private static class InMemoryGitHubSync implements GitHubSyncPort {
        Map<String, String> lastCommittedFiles = new HashMap<>();

        @Override
        public GitHubSyncResult commitFiles(
            String repoOwner,
            String repoName,
            String branch,
            String token,
            String commitMessage,
            Map<String, String> filesPathToContent
        ) {
            this.lastCommittedFiles = filesPathToContent;
            return new GitHubSyncResult(
                "fake-sha-123",
                "https://github.com/" + repoOwner + "/" + repoName + "/commit/fake-sha-123",
                filesPathToContent.size(),
                "2026-08-15T12:00:00Z"
            );
        }
    }
}
