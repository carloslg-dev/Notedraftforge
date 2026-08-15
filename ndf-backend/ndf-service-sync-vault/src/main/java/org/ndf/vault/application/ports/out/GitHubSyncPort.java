package org.ndf.vault.application.ports.out;

import org.ndf.vault.application.ports.in.SyncToGitHubUseCase.GitHubSyncResult;

import java.util.Map;

public interface GitHubSyncPort {

    record GitFilePayload(
        String path,
        String content
    ) {}

    GitHubSyncResult commitFiles(
        String repoOwner,
        String repoName,
        String branch,
        String token,
        String commitMessage,
        Map<String, String> filesPathToContent
    );
}
