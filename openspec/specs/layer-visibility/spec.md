# Spec: Layer Visibility

> References: `openspec/domain-model.md`, `openspec/specs/annotation-system/spec.md`, `openspec/specs/snapshot-and-layer-state/spec.md`

## Purpose
Define unified per-piece visibility behavior for fixed MVP layers across annotation-driven and song-cell-driven rendering.

---

## Requirements

### LV-REQ-01 — Fixed layer set
The system SHALL provide exactly 5 fixed layers in MVP:
- `chord`
- `meter`
- `breath`
- `intention`
- `comments`

Layers SHALL NOT be user-created, deleted, or renamed in MVP.

### LV-REQ-02 — Unified layer source model
Layer sources SHALL be:
- Annotation-driven layers: `breath`, `intention`, `comments`
- SongCell-driven layers: `chord`, `meter`

`chord` and `meter` visibility SHALL control rendering of `SongCell` properties, not annotation entities.

### LV-REQ-03 — Visibility storage
Layer visibility SHALL be stored in `PieceSnapshot.layerVisibility` as per-piece state.

Layer visibility SHALL be persisted through `SnapshotRepository`.

The system SHALL NOT use a separate layer repository.

### LV-REQ-04 — Toggle behavior
When a user toggles a layer, the system SHALL:
- update `PieceSnapshot.layerVisibility`
- apply/remove container class `ndf-hide-{layer}`
- persist updated snapshot visibility state
- avoid HTML regeneration

Toggling one layer SHALL NOT mutate visibility of other layers.

### LV-REQ-05 — CSS rendering contract
Visibility control SHALL use container hide classes:
- `ndf-hide-chord`
- `ndf-hide-meter`
- `ndf-hide-breath`
- `ndf-hide-intention`
- `ndf-hide-comments`

Rendered elements SHALL use:
- Annotation layers: `.ndf-annotation` + `.ndf-layer-{layerKind}`
- SongCell layers: `.ndf-song-cell-chord` and `.ndf-song-cell-meter`

### LV-REQ-06 — needsReview override
Annotations with `status='needsReview'` SHALL remain visible regardless of layer visibility state.

This override SHALL apply only to annotation-driven layers.

### LV-REQ-07 — Default visibility values
Default layer visibility for a new piece SHALL be:
- `chord = true`
- `meter = false`
- `breath = false`
- `intention = false`
- `comments = false`

### LV-REQ-08 — Mode interaction
Layer toggles SHALL be available only in `visualization` mode.

`editing` mode SHALL NOT expose layer-visibility controls.

### LV-REQ-09 — No-regeneration / no-domain-mutation rule
Layer visibility changes SHALL be purely visual state updates.

Layer visibility changes SHALL:
- NOT regenerate snapshot HTML
- NOT mutate domain content/entities
- NOT trigger snapshot invalidation

### LV-REQ-10 — Snapshot availability gate
If no snapshot exists yet, layer toggle controls SHALL remain disabled until first snapshot generation completes.

---

## Scenarios

### LV-SCN-01 — Toggle annotation layer
**GIVEN** visualization mode with existing snapshot  
**WHEN** user toggles `breath` off  
**THEN** system updates `layerVisibility.breath`, applies `ndf-hide-breath`, persists snapshot visibility, and does not regenerate HTML.

### LV-SCN-02 — Toggle song-cell layer
**GIVEN** visualization mode with song content  
**WHEN** user toggles `chord` off  
**THEN** `.ndf-song-cell-chord` elements are hidden via CSS and annotation records are unchanged.

### LV-SCN-03 — needsReview remains visible
**GIVEN** an annotation in `needsReview` state on `comments` layer  
**WHEN** `comments` layer is toggled off  
**THEN** that warning annotation remains visible.

### LV-SCN-04 — Independent toggles
**GIVEN** current visibility has `meter=false` and `breath=true`  
**WHEN** user toggles `meter` on  
**THEN** `breath` visibility remains unchanged.

### LV-SCN-05 — No snapshot yet
**GIVEN** a piece opened before first snapshot generation  
**WHEN** user opens layer panel in visualization mode  
**THEN** toggles are disabled until snapshot becomes available.

---

## Non-Goals (MVP)
- No global/shared visibility presets across pieces
- No custom layer creation or layer reordering
- No user-defined layer colors/themes
- No visibility logic based on Markdown or anchor entities
