package org.ndf.graph.application.ports.in;

import org.ndf.domain.model.flow.PerformanceFlow;

public interface IngestPerformanceFlowUseCase {
    void ingestFlow(PerformanceFlow flow);
}
