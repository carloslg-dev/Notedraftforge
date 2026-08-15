package org.ndf.showcase.application.ports.in;

import org.ndf.contracts.showcase.model.PublicReadingSurfaceDTO;

public interface GetPublicReadingSurfaceUseCase {
    PublicReadingSurfaceDTO getReadingSurface(String workspaceId);
}
