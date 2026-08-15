package org.ndf.ai.infrastructure.adapters.in.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ndf.ai.application.ports.in.AnalyzePoeticMeterUseCase;
import org.ndf.ai.application.ports.in.SuggestRhymesUseCase;
import org.ndf.contracts.ai.model.MeterAnalysisRequestDTO;
import org.ndf.contracts.ai.model.MeterAnalysisResponseDTO;
import org.ndf.contracts.ai.model.RhymeRequestDTO;
import org.ndf.contracts.ai.model.RhymeResponseDTO;

import java.util.Map;
import java.util.Objects;

@Path("/api/v1/ai")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AiPoeticAssistantResource {

    private static final String KEY_ERROR = "error";

    private final AnalyzePoeticMeterUseCase meterUseCase;
    private final SuggestRhymesUseCase rhymeUseCase;

    @Inject
    public AiPoeticAssistantResource(
        AnalyzePoeticMeterUseCase meterUseCase,
        SuggestRhymesUseCase rhymeUseCase
    ) {
        this.meterUseCase = Objects.requireNonNull(meterUseCase, "meterUseCase cannot be null");
        this.rhymeUseCase = Objects.requireNonNull(rhymeUseCase, "rhymeUseCase cannot be null");
    }

    @POST
    @Path("/meter-analysis")
    public Response analyzeMeter(MeterAnalysisRequestDTO request) {
        if (request == null || request.getText() == null || request.getText().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Text to analyze is required"))
                .build();
        }

        try {
            MeterAnalysisResponseDTO response = meterUseCase.analyzeMeter(
                request.getText(),
                request.getLanguage()
            );
            return Response.ok(response).build();
        } catch (IllegalArgumentException _) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Invalid text or language input"))
                .build();
        }
    }

    @POST
    @Path("/rhyme-suggestions")
    public Response suggestRhymes(RhymeRequestDTO request) {
        if (request == null || request.getTargetWord() == null || request.getTargetWord().isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Target word is required for rhyme suggestions"))
                .build();
        }

        try {
            String rhymeKind = request.getRhymeType() != null ? request.getRhymeType().value() : null;
            RhymeResponseDTO response = rhymeUseCase.suggestRhymes(
                request.getTargetWord(),
                request.getPoemContext(),
                rhymeKind
            );
            return Response.ok(response).build();
        } catch (IllegalArgumentException _) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Invalid rhyme request input"))
                .build();
        }
    }
}
