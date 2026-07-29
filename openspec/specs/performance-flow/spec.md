# Spec: Performance Flows & Workspaces

> References: `openspec/domain-model.md`, `openspec/terminology.md`, `docs/proposals/workspace-performance-flow.md`

## Purpose
Define the canonical behavioral specification for creating, editing, nesting, traversing, and tracing `PerformanceFlow` (Workspace) entities. This spec defines the domain rules for node-based reading paths, composite workspace embedding, live auditioning, and graph-based piece traceability.

---

## Requirements

### PF-REQ-01 — PerformanceFlow entity model
The system SHALL support `PerformanceFlow` as the domain entity representing a workspace, performance script, reading path, or curated collection.

A `PerformanceFlow` SHALL contain:
- `id`: string (UUID)
- `title`: string (non-empty)
- `description`: optional string
- `tags`: array of string tag names
- `nodes`: array of `FlowNode`
- `edges`: array of `FlowEdge`
- `createdAt` / `updatedAt`: ISO 8601 datetimes

Supported node types (`FlowNodeType`) SHALL be:
- `piece` (`PieceNode`): references an existing `Piece` entity by `pieceId` (and optional `blockId`)
- `workspace` (`WorkspaceNode`): references an existing `PerformanceFlow` entity by `workspaceId`
- `branch` (`BranchNode`): defines an interactive decision/branching point with labeled outgoing edges

The system SHALL NOT support ad-hoc text snippet nodes (`SnippetNode`); all text content MUST be encapsulated within a `Piece` entity to preserve domain integrity and traceability.

### PF-REQ-02 — Hierarchical workspace nesting (Composite Pattern)
The system SHALL allow embedding an existing `PerformanceFlow` inside another `PerformanceFlow` via `WorkspaceNode`.

When compiling or reading a workspace containing a `WorkspaceNode`:
- The system SHALL recursively expand the child workspace nodes and edges inline.
- The system SHALL validate that no circular dependency exists (e.g. `Workspace A` embedding `Workspace B` which directly or indirectly embeds `Workspace A`).

If a circular reference is detected during creation or update, the system SHALL reject the operation with a domain validation error.

### PF-REQ-03 — Branching and decision nodes
The system SHALL allow authors to model non-linear reading paths, alternate strophes, or optional refrains using `BranchNode`.

A `BranchNode` SHALL connect to two or more outgoing `FlowEdge` instances, each having a human-readable `label` (for example: `"Repeat refrain"`, `"Skip refrain"`, `"Melancholic tone"`, `"Energetic tone"`).

Each `FlowEdge` MAY specify `isPrimary: boolean` to define the default linear path when no explicit decision is selected.

### PF-REQ-04 — Graph traceability engine
The system SHALL maintain high-precision usage traceability for all `Piece` entities across all workspaces (`getPieceTraceability`).

Given a target `pieceId`, the traceability engine SHALL return:
- All workspaces directly containing a `PieceNode` referencing `pieceId`.
- All higher-level workspaces containing nested `WorkspaceNode` instances that resolve to `pieceId`.
- The full nested path chain (e.g. `["Book 2026", "Composite Poem #1"]`).

### PF-REQ-05 — Workspace UI library and canvas
The desktop workspace surface SHALL provide:
- A dual-tab sidebar allowing switching between **Pieces** and **Composite Workspaces**.
- Drag-and-drop and one-click `+` insertion of pieces or workspaces onto the active canvas.
- Usage badges on node cards displaying the traceability reference count.
- Direct navigation to create a new piece or edit an existing piece in the primary editor view.

On mobile viewports, the library sidebar SHALL collapse into a sliding bottom drawer (*sheet*).

### PF-REQ-06 — Live audition and performance mode
The system SHALL provide a continuous reading surface for live performance, recital, or author auditioning (`compileFlowToReadingSurface`).

In audition mode:
- Reaching a `WorkspaceNode` SHALL seamlessly render its inner compiled flow.
- Reaching a `BranchNode` SHALL display touch-friendly interactive option buttons.
- Selecting a branch option SHALL dynamically update the downstream reading stream in real-time without interrupting playback.

---

## Scenarios

### PF-SCN-01 — Create composite poem workspace
**GIVEN** multiple independent strophe pieces in the library  
**WHEN** user adds `PieceNode` instances to a new workspace and connects them with `FlowEdge` links  
**THEN** the system validates node references, persists the `PerformanceFlow`, and allows compiling into a continuous reading surface.

### PF-SCN-02 — Nest workspace inside book workspace
**GIVEN** an existing composite poem workspace `Workspace A`  
**WHEN** user creates a book workspace `Workspace B` and adds a `WorkspaceNode(workspaceId = Workspace A)`  
**THEN** `Workspace B` embeds `Workspace A` hierarchically without duplicating the underlying strophe pieces.

### PF-SCN-03 — Trace piece usage across nested workspaces
**GIVEN** `Piece X` used inside `Workspace A` which is embedded inside `Workspace B`  
**WHEN** user queries traceability for `Piece X`  
**THEN** the system returns `[{ workspaceId: "B", path: ["Workspace B", "Workspace A"] }]`.

### PF-SCN-04 — Reject circular workspace embedding
**GIVEN** `Workspace A` which embeds `Workspace B`  
**WHEN** user attempts to add a `WorkspaceNode(workspaceId = Workspace A)` inside `Workspace B`  
**THEN** the domain validation rejects the update with a circular dependency validation error.

### PF-SCN-05 — Live branch selection during recital audition
**GIVEN** a workspace containing a `BranchNode` with choices `"With Refrain"` and `"Without Refrain"`  
**WHEN** author reaches the branch point in live audition mode and taps `"With Refrain"`  
**THEN** the reading stream immediately injects the refrain strophe and continues down that branch.

---

## Non-Goals (MVP)
- No real-time multi-user collaborative canvas editing.
- No automated graph layout AI auto-organizer in MVP.
- No remote backend graph synchronization (persistence remains local-first via IndexedDB/Dexie).
