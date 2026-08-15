package org.ndf.ai.application.ports.in;

import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;

public interface AnalyzePoeticMeterUseCase {
    MeterAnalysisResponseDTO analyzeMeter(String text, String language);
}
