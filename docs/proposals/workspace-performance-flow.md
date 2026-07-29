# Proposal Specification: Workspaces, Reading Paths & Graph Traceability (Performance Flows)

> **Status**: Technical & Architectural Proposal for Post-MVP Epic (Workspace System)  
> **References**: `openspec/domain-model.md`, `openspec/terminology.md`, `openspec/project.md`

---

## 1. Product Vision & Graph Model

**NoteDraftForge** evolves from an individual piece editor into a **platform for narrative composition, stage performance scripting, and graph traceability**.

Authors of spoken-word poetry, songwriters, and playwrights need to:
* **Assemble Works (Hierarchical Composability)**: Build composite poems from independent strophes, and subsequently embed those full composite poems into books, albums, or performance setlists.
* **Branching & Variations (Reading Paths)**: Audition whether repeating a strophe as a refrain improves rhythm or overburdens the poem, compare two versions of a final strophe, or design interactive experiences (*"choose your own path"*).
* **High-Precision Graph Traceability**: Instantly track which books, recitals, or projects are using each individual piece or composite poem.

---

## 2. Core Domain Model (Hexagonal Domain)

To preserve **Hexagonal Architecture**, the `Piece` entity remains pure and uncoupled. Workspaces are constructed as a **Hierarchical Graph** over the `PerformanceFlow` or `Workspace` domain model.

```
                    ┌─────────────────────────┐
                    │    Workspace / Flow     │
                    └────────────┬────────────┘
                                 │
           ┌─────────────────────┴─────────────────────┐
           ▼                                           ▼
┌─────────────────────┐                     ┌─────────────────────┐
│  FlowNode (Nodes)   │                     │  FlowEdge (Conns.)  │
└──────────┬──────────┘                     └─────────────────────┘
           ├──────────────────────────┬──────────────────────────┐
           ▼                          ▼                          ▼
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   PieceNode        │    │  WorkspaceNode     │    │   BranchNode       │
│ (Ref to PieceId)   │    │ (Ref to Workspace) │    │(Branching/Choice)  │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

### 2.1 Domain Types and Value Objects

```typescript
export type FlowNodeType = 'piece' | 'workspace' | 'branch';

export interface PieceNodeData {
  pieceId: string;
  blockId?: string; // Optional: reference a specific strophe/block
}

export interface WorkspaceNodeData {
  workspaceId: string; // Allows embedding an entire Workspace (e.g. Composite Poem inside a Book)
}

export interface BranchNodeData {
  label: string; // E.g. "Repeat refrain?", "Option A vs Option B"
  defaultBranchEdgeId?: string;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number }; // Location on canvas
  data: PieceNodeData | WorkspaceNodeData | BranchNodeData;
}

export interface FlowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string; // E.g. "Yes", "No", "Recital Version"
  isPrimary?: boolean;
}

export interface PerformanceFlow {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. Graph Traceability Engine

By structuring workspaces as directed graphs, we can execute high-performance traceability queries (compatible with future graph databases like Neo4j, Kùzu, or local IndexedDB graph indices):

### Graph Relationships:
* `(Workspace A: Poem) -[:INCLUDES_PIECE]-> (Piece X: Strophe 1)`
* `(Workspace B: Book) -[:INCLUDES_WORKSPACE]-> (Workspace A: Poem)`

### Traceability Query Interface:
```typescript
export interface PieceUsageReference {
  workspaceId: string;
  workspaceTitle: string;
  path: string[]; // E.g. ["Book 2026", "Composite Poem #1"]
}

export function getPieceTraceability(
  pieceId: string,
  allWorkspaces: PerformanceFlow[]
): PieceUsageReference[] {
  // Traverses relationship graph to return all workspaces consuming the target piece
}
```

---

## 4. User Experience & Layout (UI / UX)

### 4.1 Desktop Canvas View

* **Left Panel (Library of Works & Workspaces)**:
  * Tabs to switch between **Individual Pieces** and **Composite Workspaces**.
  * Search bar by title or tag.
  * Drag & drop pieces or workspaces onto the canvas.
  * Quick actions to **Create New Piece** or **Edit Piece** (opens current editor surface).

* **Central Canvas (Node Graph View)**:
  * Interactive canvas showing piece cards and embedded workspace blocks.
  * Visual connectors to establish branching points (`BranchNode`).
  * Usage badges displaying traceability metrics.

* **Live Audition & Performance Mode**:
  * Full-screen continuous reading surface.
  * Embedded `WorkspaceNode` instances expand seamlessly inline.
  * `BranchNode` points display touch-friendly choice buttons in real-time.

### 4.2 Mobile Adaptation (Mobile-First)

* **Sliding Drawer**: The left library panel collapses into a bottom sliding drawer (*sheet*).
* **Sequential Reading Stream**: Allows toggling between the visual node map and a linear reading stream with tabbed branch selectors.

---

## 5. Implementation Roadmap

1. **Phase 1: Graph Domain Model & Traceability Engine**
   * Core types: `PerformanceFlow`, `PieceNode`, `WorkspaceNode`, and `BranchNode`.
   * Traceability lookup `getPieceTraceability` and recursive graph compiler.
2. **Phase 2: Interactive Node Canvas Interface**
   * Visual canvas editor with sidebar library and drag & drop support.
3. **Phase 3: Interactive Audition Mode & Graph Database Integration**
   * Real-time reading surface with live branch selection and usage metrics.
