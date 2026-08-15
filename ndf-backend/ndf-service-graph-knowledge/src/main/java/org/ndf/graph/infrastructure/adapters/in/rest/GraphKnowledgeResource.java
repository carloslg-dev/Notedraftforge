package org.ndf.graph.infrastructure.adapters.in.rest;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.ndf.contracts.graph.model.TraceabilityReferenceDTO;
import org.ndf.contracts.graph.model.TraceabilityResponseDTO;
import org.ndf.contracts.graph.model.WorkspaceSubgraphDTO;
import org.ndf.contracts.graph.model.WorkspaceSubgraphDTOEdgesInner;
import org.ndf.contracts.graph.model.WorkspaceSubgraphDTONodesInner;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.PieceTraceability;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.TraceReference;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.GraphEdgeInfo;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.GraphNodeInfo;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.WorkspaceSubgraph;
import org.ndf.graph.application.ports.in.IngestPerformanceFlowUseCase;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Path("/api/v1/graph")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GraphKnowledgeResource {

    private static final String KEY_ERROR = "error";
    private static final String KEY_STATUS = "status";
    private static final String KEY_WORKSPACE_ID = "workspaceId";
    private static final String KEY_NODES_COUNT = "nodesCount";
    private static final String KEY_EDGES_COUNT = "edgesCount";

    private final GetPieceTraceabilityUseCase traceabilityUseCase;
    private final GetWorkspaceSubgraphUseCase subgraphUseCase;
    private final IngestPerformanceFlowUseCase ingestUseCase;

    @Inject
    public GraphKnowledgeResource(
        GetPieceTraceabilityUseCase traceabilityUseCase,
        GetWorkspaceSubgraphUseCase subgraphUseCase,
        IngestPerformanceFlowUseCase ingestUseCase
    ) {
        this.traceabilityUseCase = Objects.requireNonNull(traceabilityUseCase);
        this.subgraphUseCase = Objects.requireNonNull(subgraphUseCase);
        this.ingestUseCase = Objects.requireNonNull(ingestUseCase);
    }

    @GET
    @Path("/traceability/{pieceId}")
    public Response getPieceTraceability(@PathParam("pieceId") String pieceId) {
        if (pieceId == null || pieceId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "pieceId path parameter is required"))
                .build();
        }

        PieceTraceability result = traceabilityUseCase.getTraceability(pieceId);

        List<TraceabilityReferenceDTO> refs = new ArrayList<>();
        if (result.references() != null) {
            for (TraceReference ref : result.references()) {
                TraceabilityReferenceDTO.NodeTypeEnum nodeType = TraceabilityReferenceDTO.NodeTypeEnum.PIECE;
                if (ref.nodeType() != null) {
                    try {
                        nodeType = TraceabilityReferenceDTO.NodeTypeEnum.fromValue(ref.nodeType());
                    } catch (IllegalArgumentException _) {
                        // Fallback to PIECE for unknown node types
                    }
                }
                refs.add(new TraceabilityReferenceDTO()
                    .workspaceId(ref.workspaceId())
                    .workspaceTitle(ref.workspaceTitle())
                    .nodeType(nodeType));
            }
        }

        TraceabilityResponseDTO response = new TraceabilityResponseDTO(
            result.pieceId(),
            result.referenceCount(),
            refs
        );

        return Response.ok(response).build();
    }

    @GET
    @Path("/workspace/{workspaceId}/subgraph")
    public Response getWorkspaceSubgraph(@PathParam("workspaceId") String workspaceId) {
        if (workspaceId == null || workspaceId.isBlank()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "workspaceId path parameter is required"))
                .build();
        }

        WorkspaceSubgraph result = subgraphUseCase.getSubgraph(workspaceId);

        List<WorkspaceSubgraphDTONodesInner> nodes = new ArrayList<>();
        if (result.nodes() != null) {
            for (GraphNodeInfo n : result.nodes()) {
                WorkspaceSubgraphDTONodesInner nodeInner = new WorkspaceSubgraphDTONodesInner()
                    .id(n.id())
                    .type(n.type())
                    .label(n.label());
                nodes.add(nodeInner);
            }
        }

        List<WorkspaceSubgraphDTOEdgesInner> edges = new ArrayList<>();
        if (result.edges() != null) {
            for (GraphEdgeInfo e : result.edges()) {
                WorkspaceSubgraphDTOEdgesInner.KindEnum kind = WorkspaceSubgraphDTOEdgesInner.KindEnum.PRIMARY;
                if ("branch".equalsIgnoreCase(e.kind())) {
                    kind = WorkspaceSubgraphDTOEdgesInner.KindEnum.BRANCH;
                }
                WorkspaceSubgraphDTOEdgesInner edgeInner = new WorkspaceSubgraphDTOEdgesInner()
                    .source(e.source())
                    .target(e.target())
                    .kind(kind)
                    .conditionLabel(e.conditionLabel());
                edges.add(edgeInner);
            }
        }

        WorkspaceSubgraphDTO response = new WorkspaceSubgraphDTO(
            result.rootWorkspaceId(),
            result.totalNodes(),
            nodes,
            edges
        );

        return Response.ok(response).build();
    }

    @POST
    @Path("/ingest")
    public Response ingestFlow(PerformanceFlow flow) {
        if (flow == null || flow.getId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of(KEY_ERROR, "Valid PerformanceFlow is required for ingestion"))
                .build();
        }

        ingestUseCase.ingestFlow(flow);
        return Response.ok(Map.of(
            KEY_STATUS, "INGESTED",
            KEY_WORKSPACE_ID, flow.getId(),
            KEY_NODES_COUNT, flow.getNodes().size(),
            KEY_EDGES_COUNT, flow.getEdges().size()
        )).build();
    }
}
