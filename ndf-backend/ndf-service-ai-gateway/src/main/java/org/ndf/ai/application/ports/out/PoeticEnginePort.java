package org.ndf.ai.application.ports.out;

import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;
import org.ndf.contracts.ai.model.RhymeResponseDTO;

public interface PoeticEnginePort {
    MeterAnalysisResponseDTO computeMeter(String text, String language);
    RhymeResponseDTO computeRhymes(String targetWord, String poemContext, String rhymeType);
}
