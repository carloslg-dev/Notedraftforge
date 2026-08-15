package org.ndf.ai.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.ai.application.services.AiPoeticAssistantService;
import org.ndf.ai.infrastructure.adapters.out.langchain.LangChainPoeticAdapter;
import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;
import org.ndf.contracts.ai.model.RhymeResponseDTO;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AiPoeticAssistantServiceTest {

    private AiPoeticAssistantService service;

    @BeforeEach
    void setUp() {
        LangChainPoeticAdapter adapter = new LangChainPoeticAdapter();
        service = new AiPoeticAssistantService(adapter);
    }

    @Test
    @DisplayName("Should analyze Spanish poetic meter and detect lines and syllable cadence")
    void shouldAnalyzeSpanishPoeticMeter() {
        String poem = """
            Volverán las oscuras golondrinas
            en tu balcón sus nidos a colgar,
            y otra vez con el ala a sus cristales
            jugando llamarán.
            """;

        MeterAnalysisResponseDTO response = service.analyzeMeter(poem, "es");

        assertThat(response.getTotalLines()).isEqualTo(4);
        assertThat(response.getStanzas()).hasSize(4);
        assertThat(response.getOverallRhythm()).isNotBlank();
        assertThat(response.getStanzas().get(0).getLine()).isEqualTo("Volverán las oscuras golondrinas");
        assertThat(response.getStanzas().get(0).getSyllableCount()).isPositive();
    }

    @Test
    @DisplayName("Should suggest contextual rhymes for a target word")
    void shouldSuggestContextualRhymes() {
        RhymeResponseDTO response = service.suggestRhymes("estrella", "en la noche oscura", "consonant");

        assertThat(response.getTargetWord()).isEqualTo("estrella");
        assertThat(response.getCandidates()).isNotEmpty();
        assertThat(response.getCandidates().get(0).getWord()).isNotEqualTo("estrella");
        assertThat(response.getCandidates().get(0).getRhymeKind()).isEqualTo("consonant");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when analyzing blank or null text")
    void shouldThrowExceptionOnBlankText() {
        assertThatThrownBy(() -> service.analyzeMeter("", "es"))
            .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> service.analyzeMeter(null, "es"))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when suggesting rhymes for blank target word")
    void shouldThrowExceptionOnBlankTargetWord() {
        assertThatThrownBy(() -> service.suggestRhymes("  ", "context", "consonant"))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
