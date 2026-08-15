package org.ndf.vault.application.ports.in;

import org.ndf.domain.model.vault.VaultContent;

public interface SyncToGitHubUseCase {

    record GitHubSyncCommand(
        String userId,
        String repoOwner,
        String repoName,
        String branch,
        String personalAccessToken,
        String commitMessage,
        VaultContent content
    ) {}

    record GitHubSyncResult(
        String commitSha,
        String commitUrl,
        int filesCommitted,
        String syncedAt
    ) {}

    GitHubSyncResult syncToGitHub(GitHubSyncCommand command);
}
