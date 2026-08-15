package org.ndf.graph.infrastructure.adapters.out.neo4j;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.ndf.domain.model.flow.FlowNode;
import org.ndf.domain.model.flow.PieceNode;
import org.ndf.domain.model.flow.PerformanceFlow;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.PieceTraceability;
import org.ndf.graph.application.ports.in.GetPieceTraceabilityUseCase.TraceReference;
import org.ndf.graph.application.ports.in.GetWorkspaceSubgraphUseCase.WorkspaceSubgraph;
import org.ndf.graph.application.ports.out.GraphStoragePort;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class Neo4jGraphAdapter implements GraphStoragePort {

    private final Driver driver;

    public Neo4jGraphAdapter(Driver driver) {
        this.driver = Objects.requireNonNull(driver, "Neo4j Driver cannot be null");
    }

    @Override
    public void storeFlow(PerformanceFlow flow) {
        try (Session session = driver.session()) {
            session.executeWrite(tx -> {
                tx.run("MERGE (w:Workspace {id: $id}) SET w.title = $title, w.description = $desc",
                    Map.of("id", flow.getId(), "title", flow.getTitle(), "desc", flow.getDescription() != null ? flow.getDescription() : ""));

                for (FlowNode node : flow.getNodes()) {
                    if (node instanceof PieceNode pn) {
                        tx.run("MERGE (p:Piece {id: $pieceId}) " +
                               "MERGE (w:Workspace {id: $wsId}) " +
                               "MERGE (w)-[:CONTAINS {nodeId: $nodeId}]->(p)",
                            Map.of("pieceId", pn.pieceId(), "wsId", flow.getId(), "nodeId", pn.id()));
                    }
                }
                return null;
            });
        }
    }

    @Override
    public PieceTraceability findPieceTraceability(String pieceId) {
        List<TraceReference> refs = new ArrayList<>();
        try (Session session = driver.session()) {
            session.executeRead(tx -> {
                var result = tx.run(
                    "MATCH (w:Workspace)-[r:CONTAINS]->(p:Piece {id: $pieceId}) RETURN w.id AS wsId, w.title AS title, r.nodeId AS nodeId",
                    Map.of("pieceId", pieceId)
                );
                while (result.hasNext()) {
                    var row = result.next();
                    refs.add(new TraceReference(
                        row.get("wsId").asString(),
                        row.get("title").asString(),
                        "piece",
                        row.get("nodeId").asString()
                    ));
                }
                return null;
            });
        }
        return new PieceTraceability(pieceId, refs.size(), refs);
    }

    @Override
    public WorkspaceSubgraph findWorkspaceSubgraph(String workspaceId) {
        return new WorkspaceSubgraph(workspaceId, 0, List.of(), List.of());
    }
}
