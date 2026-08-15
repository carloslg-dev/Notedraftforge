package org.ndf.vault.application.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.ndf.domain.model.common.AuditMetadata;
import org.ndf.domain.model.piece.Piece;
import org.ndf.domain.model.vault.VaultContent;
import org.ndf.domain.model.vault.VaultSnapshot;
import org.ndf.vault.application.exceptions.RevisionConflictException;
import org.ndf.vault.application.ports.in.GetLatestVaultUseCase;
import org.ndf.vault.application.ports.in.SyncToGitHubUseCase;
import org.ndf.vault.application.ports.in.SyncVaultUseCase;
import org.ndf.vault.application.ports.out.GitHubSyncPort;
import org.ndf.vault.application.ports.out.VaultStoragePort;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@ApplicationScoped
public class VaultSyncService implements SyncVaultUseCase, GetLatestVaultUseCase, SyncToGitHubUseCase {

    private static final String STATUS_SYNCHRONIZED = "SYNCHRONIZED";
    private static final String PIECE_FILE_PATH_TEMPLATE = "pieces/%s/%s_%s.md";
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9_-]");

    private final VaultStoragePort storagePort;
    private final GitHubSyncPort gitHubPort;

    @Inject
    public VaultSyncService(VaultStoragePort storagePort, GitHubSyncPort gitHubPort) {
        this.storagePort = Objects.requireNonNull(storagePort, "storagePort cannot be null");
        this.gitHubPort = Objects.requireNonNull(gitHubPort, "gitHubPort cannot be null");
    }

    @Override
    public SyncResult syncVault(SyncCommand command) {
        Objects.requireNonNull(command, "SyncCommand cannot be null");

        Optional<VaultSnapshot> existingOpt = storagePort.findLatestByUserId(command.userId());

        int nextRevision = 0;
        String now = Instant.now().toString();

        if (existingOpt.isPresent()) {
            VaultSnapshot existing = existingOpt.get();
            int serverRev = existing.getRevision();

            // Optimistic concurrency check: client revision must be >= server revision
            if (command.clientRevision() < serverRev) {
                throw new RevisionConflictException(
                    "Client revision " + command.clientRevision() + " is stale compared to server revision " + serverRev,
                    serverRev,
                    command.clientRevision()
                );
            }
            nextRevision = serverRev + 1;
        }

        AuditMetadata audit = new AuditMetadata(nextRevision, now, now);
        String snapshotId = UUID.randomUUID().toString();
        VaultSnapshot newSnapshot = new VaultSnapshot(snapshotId, command.userId(), command.content(), audit);

        storagePort.save(newSnapshot);

        return new SyncResult(STATUS_SYNCHRONIZED, nextRevision, now);
    }

    @Override
    public Optional<VaultSnapshot> getLatestVault(String userId) {
        Objects.requireNonNull(userId, "userId cannot be null");
        return storagePort.findLatestByUserId(userId);
    }

    @Override
    public GitHubSyncResult syncToGitHub(GitHubSyncCommand command) {
        Objects.requireNonNull(command, "GitHubSyncCommand cannot be null");

        Map<String, String> files = new HashMap<>();

        for (Piece piece : command.content().pieces()) {
            String sanitizedTitle = NON_ALPHANUMERIC.matcher(piece.getTitle().toLowerCase()).replaceAll("-");
            String filename = String.format(
                PIECE_FILE_PATH_TEMPLATE,
                piece.getType().name().toLowerCase(),
                piece.getId(),
                sanitizedTitle
            );
            String markdownContent = convertPieceToMarkdownWithFrontmatter(piece);
            files.put(filename, markdownContent);
        }

        return gitHubPort.commitFiles(
            command.repoOwner(),
            command.repoName(),
            command.branch(),
            command.personalAccessToken(),
            command.commitMessage(),
            files
        );
    }

    private String convertPieceToMarkdownWithFrontmatter(Piece piece) {
        StringBuilder sb = new StringBuilder();
        sb.append("---\n");
        sb.append("id: \"").append(piece.getId()).append("\"\n");
        sb.append("title: \"").append(piece.getTitle().replace("\"", "\\\"")).append("\"\n");
        sb.append("type: \"").append(piece.getType().name().toLowerCase()).append("\"\n");
        sb.append("language: \"").append(piece.getLanguage()).append("\"\n");
        sb.append("revision: ").append(piece.getRevision()).append("\n");
        if (!piece.getMetadata().tags().isEmpty()) {
            sb.append("tags:\n");
            for (String tag : piece.getMetadata().tags()) {
                sb.append("  - \"").append(tag).append("\"\n");
            }
        }
        sb.append("---\n\n");
        sb.append("# ").append(piece.getTitle()).append("\n\n");
        sb.append(piece.getContent().getPlainText()).append("\n");
        return sb.toString();
    }
}
