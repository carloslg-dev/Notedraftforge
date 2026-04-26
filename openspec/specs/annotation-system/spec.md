# Spec: Annotation System

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Define how annotations are created, validated, updated, deleted, rendered, and reviewed using the structured `AnnotationTarget` model. This spec is behavioral source of truth and does not depend on editor internals or legacy anchor-tag mechanisms.

---

## Requirements

### AS-REQ-01 — Annotation target model
The system SHALL use `AnnotationTarget` as the only annotation targeting mechanism.

An `Annotation` SHALL reference:
- `target: AnnotationTarget`

Supported target types in the domain model SHALL be:
- `TextRangeTarget`
- `TextNodeTarget`
- `SongCellTarget`
- `SongCellRangeTarget`

For MVP user-created annotation flows, the system SHALL support:
- `TextRangeTarget`
- `TextNodeTarget`

`SongCellTarget` and `SongCellRangeTarget` SHALL remain available in the domain model for future song flows, but full song annotation flows are out of MVP scope unless explicitly specced.

The system SHALL NOT depend on anchor entities, embedded anchor tags, or anchor parsing logic.

### AS-REQ-02 — Target resolution and validation
On create/update, the system SHALL validate that the annotation target resolves inside the same piece.

Validation SHALL include:
- referenced `blockId` / `runId` / `sectionId` / `cellId` existence
- valid offset bounds for text ranges

If create/update receives an invalid target, the system SHALL reject the operation and return validation feedback.

For `TextRangeTarget`, offsets SHALL be measured against plain text produced by concatenating all `TextRun.text` values in the referenced `TextBlock`.

Inline marks SHALL NOT affect offset calculations.

### AS-REQ-03 — Annotation kinds (MVP)
The system SHALL allow only these annotation kinds in MVP:
- `breath`
- `intent`
- `comment`

The system SHALL NOT treat `chord` or `meter` as annotation kinds.

### AS-REQ-04 — Chord/meter ownership and rendering
The system SHALL treat `chord` and `meter` as `SongCell` properties, not annotations.

Rendering SHALL expose chord/meter through layer visibility as visual channels.

### AS-REQ-05 — Create annotation
When a valid annotation create request is submitted, the system SHALL:
- create annotation with UUID
- persist `target`, `kind`, `content`, `layerId`, and `status='valid'`
- update `Piece.updatedAt`
- increment `Piece.revision`
- persist annotation and piece changes through ports
- mark snapshot as stale and trigger regeneration

### AS-REQ-06 — Update annotation
When an annotation is updated, the system SHALL:
- validate target and content
- persist updated annotation
- update `Piece.updatedAt`
- increment `Piece.revision`
- invalidate snapshot

`kind` SHALL be immutable after creation in MVP.

### AS-REQ-07 — Delete annotation
When an annotation is deleted, the system SHALL:
- delete it by `id`
- update `Piece.updatedAt`
- increment `Piece.revision`
- invalidate snapshot

Delete behavior SHALL NOT include any anchor lifecycle/cascade logic.

### AS-REQ-08 — needsReview trigger and behavior
The system SHALL set `status='needsReview'` when an existing annotation target can no longer be resolved (for example, missing block/run/cell references or offsets out of bounds after later content changes).

The system SHALL NOT attempt auto-repair in MVP.

A `needsReview` annotation SHALL remain visible according to layer visibility rules and warning-state rendering.

### AS-REQ-09 — Resolve needsReview
The system SHALL allow resolving a `needsReview` annotation via explicit user action:
- confirm current target as valid (if resolvable)
- retarget annotation to a valid `AnnotationTarget`
- delete annotation

Resolve actions SHALL persist updates and invalidate snapshot.

### AS-REQ-10 — Layer visibility
Layer toggles SHALL update `PieceSnapshot.layerVisibility` and apply CSS visibility changes without regenerating HTML.

`needsReview` annotations SHALL remain visually distinguishable.

---

## Scenarios

### AS-SCN-01 — Create text-range annotation
**GIVEN** a piece with structured text content  
**WHEN** user creates a `comment` with `TextRangeTarget(blockId, startOffset, endOffset)`  
**THEN** the system validates offsets against concatenated `TextRun.text`, persists annotation, and increments piece revision.

### AS-SCN-02 — Reject out-of-bounds range
**GIVEN** a piece text block whose plain-text length is `N`  
**WHEN** user submits create/update with a `TextRangeTarget` whose offsets are outside `[0, N]`  
**THEN** the operation is rejected with validation feedback and no annotation mutation is persisted.

### AS-SCN-03 — Update annotation target
**GIVEN** an existing `breath` annotation  
**WHEN** user updates its target to another valid `TextRangeTarget` or `TextNodeTarget`  
**THEN** the system persists the updated target, updates piece metadata/revision, and invalidates snapshot.

### AS-SCN-04 — Delete annotation
**GIVEN** an existing annotation  
**WHEN** user deletes it  
**THEN** the system deletes annotation only, updates piece revision, and performs no anchor-related cleanup.

### AS-SCN-05 — needsReview on unresolved target
**GIVEN** an annotation referencing a removed `blockId`  
**WHEN** system validates annotation targets during load/update cycle  
**THEN** annotation status becomes `needsReview` and remains visible with warning styling.

### AS-SCN-06 — Chord/meter are not annotations
**GIVEN** a song piece with `SongCell.chord` and `SongCell.meter` data  
**WHEN** visualization layers are toggled  
**THEN** chord/meter are rendered as song-cell visual properties, not as `Annotation` records.

---

## Non-Goals (MVP)
- No advanced range merging/splitting heuristics
- No collaborative conflict resolution
- No AI correction/auto-fix for invalid targets
- No multi-target annotation composition beyond the defined `AnnotationTarget` variants
