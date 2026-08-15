package org.ndf.domain.model.flow;

import org.ndf.domain.model.common.AuditMetadata;

import java.util.List;
import java.util.Objects;

/**
 * PerformanceFlow is the Aggregate Root for workspace setlists, anthologies, and recital decision graphs.
 * Validates graph edge consistency and tracks revision history.
 */
public class PerformanceFlow {
    private final String id;
    private FlowMetadata metadata;
    private FlowStructure structure;
    private AuditMetadata audit;

    public PerformanceFlow(String id, FlowMetadata metadata, FlowStructure structure, AuditMetadata audit) {
        this.id = Objects.requireNonNull(id, "PerformanceFlow ID cannot be null");
        this.metadata = metadata != null ? metadata : FlowMetadata.empty();
        this.structure = structure != null ? structure : FlowStructure.empty();
        this.audit = audit != null ? audit : AuditMetadata.initial();
    }

    public static PerformanceFlow createNew(String id, String title, String description) {
        return new PerformanceFlow(
            id,
            FlowMetadata.of(title, description),
            FlowStructure.empty(),
            AuditMetadata.initial()
        );
    }

    public static PerformanceFlow of(String id, FlowMetadata metadata, FlowStructure structure) {
        return new PerformanceFlow(id, metadata, structure, AuditMetadata.initial());
    }

    public void updateMetadata(FlowMetadata newMetadata) {
        this.metadata = Objects.requireNonNull(newMetadata, "FlowMetadata cannot be null");
        this.audit = this.audit.nextRevision();
    }

    public void updateStructure(FlowStructure newStructure) {
        this.structure = Objects.requireNonNull(newStructure, "FlowStructure cannot be null");
        this.audit = this.audit.nextRevision();
    }

    public void updateStructure(List<FlowNode> nodes, List<FlowEdge> edges) {
        updateStructure(FlowStructure.of(nodes, edges));
    }

    public String getId() {
        return id;
    }

    public FlowMetadata getMetadata() {
        return metadata;
    }

    public FlowStructure getStructure() {
        return structure;
    }

    public AuditMetadata getAudit() {
        return audit;
    }

    // Convenience Delegations for Domain Querying
    public String getTitle() {
        return metadata.title();
    }

    public String getDescription() {
        return metadata.description();
    }

    public List<FlowNode> getNodes() {
        return structure.nodes();
    }

    public List<FlowEdge> getEdges() {
        return structure.edges();
    }

    public int getRevision() {
        return audit.revision();
    }
}
