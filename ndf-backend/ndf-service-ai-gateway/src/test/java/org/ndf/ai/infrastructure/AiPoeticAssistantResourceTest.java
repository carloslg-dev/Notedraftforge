package org.ndf.ai.infrastructure;

import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.ndf.ai.application.ports.in.AnalyzePoeticMeterUseCase;
import org.ndf.ai.application.ports.in.SuggestRhymesUseCase;
import org.ndf.ai.infrastructure.adapters.in.rest.AiPoeticAssistantResource;
import org.ndf.contracts.ai.model.MeterAnalysisRequestDTO;
import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;
import org.ndf.contracts.ai.model.RhymeCandidateDTO;
import org.ndf.contracts.ai.model.RhymeRequestDTO;
import org.ndf.contracts.ai.model.RhymeResponseDTO;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class AiPoeticAssistantResourceTest {

    private static final String TARGET_WORD = "estrella";
    private static final String SAMPLE_VERSE = "Volverán las oscuras golondrinas";

    private FakeMeterUseCase meterUseCase;
    private FakeRhymeUseCase rhymeUseCase;
    private AiPoeticAssistantResource resource;

    @BeforeEach
    void setUp() {
        meterUseCase = new FakeMeterUseCase();
        rhymeUseCase = new FakeRhymeUseCase();
        resource = new AiPoeticAssistantResource(meterUseCase, rhymeUseCase);
    }

    @Test
    @DisplayName("Should return 200 OK with MeterAnalysisResponseDTO on valid meter analysis request")
    void shouldReturnOkOnValidMeterAnalysis() {
        MeterAnalysisRequestDTO request = new MeterAnalysisRequestDTO();
        request.setText(SAMPLE_VERSE);
        request.setLanguage("es");

        Response response = resource.analyzeMeter(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(MeterAnalysisResponseDTO.class);
        MeterAnalysisResponseDTO entity = (MeterAnalysisResponseDTO) response.getEntity();
        assertThat(entity.getTotalLines()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should return 400 BAD REQUEST when meter analysis request is empty or missing text")
    void shouldReturnBadRequestOnMissingMeterText() {
        MeterAnalysisRequestDTO request = new MeterAnalysisRequestDTO();
        request.setText("");

        Response response = resource.analyzeMeter(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.BAD_REQUEST.getStatusCode());
    }

    @Test
    @DisplayName("Should return 200 OK with RhymeResponseDTO on valid rhyme request")
    void shouldReturnOkOnValidRhymeRequest() {
        RhymeRequestDTO request = new RhymeRequestDTO();
        request.setTargetWord(TARGET_WORD);
        request.setPoemContext("cielo de noche");

        Response response = resource.suggestRhymes(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.OK.getStatusCode());
        assertThat(response.getEntity()).isInstanceOf(RhymeResponseDTO.class);
        RhymeResponseDTO entity = (RhymeResponseDTO) response.getEntity();
        assertThat(entity.getTargetWord()).isEqualTo(TARGET_WORD);
    }

    @Test
    @DisplayName("Should return 400 BAD REQUEST when rhyme request target word is missing")
    void shouldReturnBadRequestOnMissingRhymeTargetWord() {
        RhymeRequestDTO request = new RhymeRequestDTO();
        request.setTargetWord(null);

        Response response = resource.suggestRhymes(request);

        assertThat(response.getStatus()).isEqualTo(Response.Status.BAD_REQUEST.getStatusCode());
    }

    private static class FakeMeterUseCase implements AnalyzePoeticMeterUseCase {
        @Override
        public MeterAnalysisResponseDTO analyzeMeter(String text, String language) {
            MeterAnalysisResponseDTO dto = new MeterAnalysisResponseDTO();
            dto.setTotalLines(1);
            dto.setOverallRhythm("Endecasílabo");
            return dto;
        }
    }

    private static class FakeRhymeUseCase implements SuggestRhymesUseCase {
        @Override
        public RhymeResponseDTO suggestRhymes(String targetWord, String poemContext, String rhymeType) {
            RhymeResponseDTO dto = new RhymeResponseDTO();
            dto.setTargetWord(targetWord);
            RhymeCandidateDTO candidate = new RhymeCandidateDTO();
            candidate.setWord("bella");
            dto.setCandidates(List.of(candidate));
            return dto;
        }
    }
}
