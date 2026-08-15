package org.ndf.ai.application.services;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.ndf.ai.application.ports.in.AnalyzePoeticMeterUseCase;
import org.ndf.ai.application.ports.in.SuggestRhymesUseCase;
import org.ndf.ai.application.ports.out.PoeticEnginePort;
import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;
import org.ndf.contracts.ai.model.RhymeResponseDTO;

import java.util.Objects;

@ApplicationScoped
public class AiPoeticAssistantService implements AnalyzePoeticMeterUseCase, SuggestRhymesUseCase {

    private static final String DEFAULT_LANGUAGE = "es";
    private static final String DEFAULT_RHYME_TYPE = "consonant";

    private final PoeticEnginePort poeticEngine;

    @Inject
    public AiPoeticAssistantService(PoeticEnginePort poeticEngine) {
        this.poeticEngine = Objects.requireNonNull(poeticEngine, "poeticEngine cannot be null");
    }

    @Override
    public MeterAnalysisResponseDTO analyzeMeter(String text, String language) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text to analyze cannot be empty");
        }

        String effectiveLanguage = (language != null && !language.isBlank())
            ? language.trim().toLowerCase()
            : DEFAULT_LANGUAGE;

        return poeticEngine.computeMeter(text, effectiveLanguage);
    }

    @Override
    public RhymeResponseDTO suggestRhymes(String targetWord, String poemContext, String rhymeType) {
        if (targetWord == null || targetWord.isBlank()) {
            throw new IllegalArgumentException("Target word for rhymes cannot be empty");
        }

        String effectiveRhymeType = (rhymeType != null && !rhymeType.isBlank())
            ? rhymeType.trim().toLowerCase()
            : DEFAULT_RHYME_TYPE;

        return poeticEngine.computeRhymes(targetWord.trim(), poemContext, effectiveRhymeType);
    }
}
