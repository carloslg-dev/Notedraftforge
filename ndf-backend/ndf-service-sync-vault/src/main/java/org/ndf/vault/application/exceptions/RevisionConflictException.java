package org.ndf.vault.application.exceptions;

public class RevisionConflictException extends RuntimeException {
    private final int serverRevision;
    private final int clientRevision;

    public RevisionConflictException(String message, int serverRevision, int clientRevision) {
        super(message);
        this.serverRevision = serverRevision;
        this.clientRevision = clientRevision;
    }

    public int getServerRevision() {
        return serverRevision;
    }

    public int getClientRevision() {
        return clientRevision;
    }
}
