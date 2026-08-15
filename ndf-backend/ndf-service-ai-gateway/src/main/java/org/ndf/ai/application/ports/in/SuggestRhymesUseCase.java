package org.ndf.ai.application.ports.in;

import org.ndf.contracts.ai.model.RhymeResponseDTO;

public interface SuggestRhymesUseCase {
    RhymeResponseDTO suggestRhymes(String targetWord, String poemContext, String rhymeType);
}
