# Spec: Snapshot and Layer State

> References: `openspec/domain-model.md`, `openspec/architecture.md`, `openspec/specs/annotation-system/spec.md`, `openspec/specs/editor-modes/spec.md`

## Purpose
Define how `PieceSnapshot` is generated, invalidated, stored, and used for visualization with fixed layer visibility behavior in a structured-content system.

---

## Requirements

### SL-REQ-01 — Snapshot source model
Snapshot generation SHALL consume:
- structured `Piece.content` (`PieceContent`)
- all `Annotation` entities of the piece

The system SHALL NOT depend on anchor entities, anchor tags, or Markdown parsing as internal source-of-truth behavior.

### SL-REQ-02 — Renderer responsibilities
The renderer SHALL:
- produce static HTML (`PieceSnapshot.html`)
- include rendered data for all supported layers
- embed metadata needed to resolve DOM selections back to `AnnotationTarget`

Renderer metadata SHALL be sufficient to reconstruct targets (for example block/run identifiers and offsets where applicable), without prescribing exact attribute names in this spec.

### SL-REQ-03 — Layer model
MVP layer set SHALL remain fixed to 5 layers:
- `chord`
- `meter`
- `breath`
- `intention`
- `comments`

Layer source model SHALL be:
- Annotation-driven layers: `breath`, `intention`, `comments`
- SongCell-driven visual layers: `chord`, `meter`

`chord` and `meter` SHALL be treated as `SongCell` visual properties, not annotation records.

### SL-REQ-04 — Rendering class contract
Snapshot HTML SHALL contain all renderable data regardless of current visibility toggles.

Rendering SHALL follow CSS contracts:
- annotation elements include `.ndf-annotation` and `.ndf-layer-{layerKind}`
- `needsReview` annotations include `.ndf-needs-review`
- song-cell chord elements include `.ndf-song-cell-chord`
- song-cell meter elements include `.ndf-song-cell-meter`

### SL-REQ-05 — Layer visibility state and behavior
`PieceSnapshot.layerVisibility` SHALL store per-piece visibility for all fixed layers.

Layer toggle behavior SHALL:
- update `layerVisibility`
- apply/remove container CSS classes
- persist updated snapshot state
- NOT regenerate snapshot HTML

CSS hide rules SHALL cover both:
- annotation-driven layers
- song-cell-driven layers

### SL-REQ-06 — needsReview visibility
Annotations with `status='needsReview'` SHALL remain visible regardless of layer toggle state.

### SL-REQ-07 — Snapshot invalidation
Snapshot SHALL be treated as stale when:
- `Piece.content` changes
- any annotation changes (create/update/delete)

No anchor-related invalidation logic SHALL exist.

Revision consistency SHALL apply:
- current when `PieceSnapshot.sourceRevision === Piece.revision`
- stale when `PieceSnapshot.sourceRevision < Piece.revision`

### SL-REQ-08 — Snapshot lifecycle
Lifecycle SHALL follow infrastructure-driven flow:
1. user/domain change occurs
2. data persists
3. `Piece.revision` increments (when applicable)
4. snapshot is marked stale
5. background regeneration produces and stores fresh snapshot

Lifecycle SHALL NOT include anchor integrity passes, anchor regeneration, or Markdown reparse flows.

### SL-REQ-09 — No-snapshot fallback
If no snapshot exists for visualization:
- system SHALL render base structured content in read-only form
- annotation actions SHALL remain disabled
- snapshot generation SHALL be triggered in background
- view SHALL switch to snapshot rendering once first snapshot is ready

### SL-REQ-10 — Snapshot usage in visualization
Visualization mode SHALL render `PieceSnapshot.html` directly.

If snapshot exists but is stale, system SHALL show stale snapshot immediately and regenerate in background.

### SL-REQ-11 — Generation boundaries
Snapshot generation SHALL run in infrastructure and SHALL be independent of UI framework specifics.

Renderer and snapshot persistence SHALL remain behind ports/adapters.

---

## Scenarios

### SL-SCN-01 — Generate snapshot after content change
**GIVEN** a piece with structured content  
**WHEN** content is changed and persisted  
**THEN** revision advances, existing snapshot becomes stale, and a background generation stores fresh `PieceSnapshot`.

### SL-SCN-02 — Generate snapshot after annotation change
**GIVEN** a piece with existing snapshot  
**WHEN** an annotation is created, updated, or deleted  
**THEN** snapshot is invalidated and regenerated from `PieceContent + Annotation[]`.

### SL-SCN-03 — Toggle visibility without re-render
**GIVEN** a rendered snapshot in visualization mode  
**WHEN** user toggles `meter` layer  
**THEN** system updates `layerVisibility`, applies container CSS class, and does not regenerate HTML.

### SL-SCN-04 — needsReview remains visible
**GIVEN** an annotation with `status='needsReview'`  
**WHEN** its layer is toggled off  
**THEN** warning annotation remains visible.

### SL-SCN-05 — No snapshot fallback
**GIVEN** a piece with no snapshot yet  
**WHEN** user opens visualization mode  
**THEN** base structured content is shown read-only, annotation actions are disabled, and background snapshot generation starts.

### SL-SCN-06 — Stale snapshot fast-load
**GIVEN** a stored snapshot with `sourceRevision < Piece.revision`  
**WHEN** user opens visualization mode  
**THEN** stale snapshot is shown immediately and replaced automatically once fresh snapshot finishes.

### SL-SCN-07 — Selection mapping metadata
**GIVEN** visualization mode with rendered snapshot HTML  
**WHEN** user selects text for annotation interaction  
**THEN** renderer metadata enables infrastructure mapping from DOM selection to `AnnotationTarget`.

---

## Non-Goals (MVP)
- No partial snapshot patching (full regeneration only)
- No anchor-based rendering or repair logic
- No Markdown-internal rendering pipeline
- No snapshot diff/version history UI
- No user-configurable generation timing (future scope)
