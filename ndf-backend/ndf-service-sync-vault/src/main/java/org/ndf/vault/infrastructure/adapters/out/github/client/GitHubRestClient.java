package org.ndf.vault.infrastructure.adapters.out.github.client;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.HeaderParam;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "github-api")
public interface GitHubRestClient {

    record CreateOrUpdateFileRequest(
        String message,
        String content, // Base64 encoded content
        String branch,
        String sha // Optional existing sha if updating
    ) {}

    record CommitResponse(
        CommitInfo commit,
        ContentInfo content
    ) {
        public record CommitInfo(String sha, String html_url) {}
        public record ContentInfo(String name, String path, String sha) {}
    }

    @PUT
    @Path("/repos/{owner}/{repo}/contents/{path}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    CommitResponse putFile(
        @HeaderParam("Authorization") String authHeader,
        @HeaderParam("Accept") String acceptHeader,
        @PathParam("owner") String owner,
        @PathParam("repo") String repo,
        @PathParam("path") String path,
        CreateOrUpdateFileRequest request
    );
}
