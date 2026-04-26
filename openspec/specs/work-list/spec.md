# Spec: Work List

> References: `openspec/domain-model.md`, `openspec/specs/piece-management/spec.md`, `openspec/terminology.md`

## Purpose
Define list-level behavior for browsing Works (Pieces), filtering by structured tags, and navigating to a selected piece.

---

## Requirements

### WL-REQ-01 — List load and default order
When the Work List is opened, the system SHALL load all pieces via `PieceRepository.getAll()`.

Default sorting SHALL be `updatedAt` descending (most recently updated first).

### WL-REQ-02 — List item display
Each list item SHALL display:
- piece `title`
- type badge (resolved from `TagRef(kind="type")` or `Piece.type`)
- up to 2–3 user tags (`TagRef(kind="user")`) near/below title
- `updatedAt` information for recency context

Work List SHALL NOT display editor-internal payloads or Markdown source content.

### WL-REQ-03 — Type display semantics
Type semantics SHALL be consistent with structured tags:
- canonical type representation in tags is `TagRef(kind="type", value=<type>)`
- `Piece.type` remains valid typed metadata

If both are present, list presentation SHALL show the consistent type value.

### WL-REQ-04 — Structured filtering model
Filtering SHALL operate on `TagRef[]` structure, not plain string arrays.

Filter controls SHALL support:
- type tags (`kind="type"`)
- user tags (`kind="user"`)

Type and user filters SHALL NOT rely on mixed plain-string matching.

### WL-REQ-05 — User tag matching rules
User tag filter matching SHALL be case-insensitive on `TagRef.value`.

Type tags SHALL match by normalized type value (`text | poem | song`).

### WL-REQ-06 — Filter application behavior
Selected filters SHALL be applied client-side to loaded list data.

A piece SHALL match only when it satisfies all active filter criteria.

Clearing all filters SHALL restore full list visibility.

### WL-REQ-07 — Empty states
The system SHALL support two empty states:
1. **No pieces exist**
   - show empty-list message
   - show actions to create/import
2. **No results after filtering**
   - show no-results message
   - preserve current filters until user clears/changes them

### WL-REQ-08 — Song type visibility in list
If pieces of type `song` exist, the Work List SHALL display them with type `song` badge like other types.

Full song editing/viewing behavior is out of scope for this spec and SHALL be defined elsewhere.

### WL-REQ-09 — Navigation behavior
Tapping a list item SHALL navigate to the piece flow entry defined by editor-mode specs.

List behavior SHALL remain independent from editor implementation internals.

### WL-REQ-10 — Type change scope in list
Work List SHALL NOT treat piece type changes as inline simple metadata edits.

Any type-change flow SHALL follow dedicated piece-management constraints (disabled or future migration flow).

---

## Scenarios

### WL-SCN-01 — Load and sort list
**GIVEN** multiple pieces with different `updatedAt` values  
**WHEN** user opens Work List  
**THEN** items appear ordered by `updatedAt` descending.

### WL-SCN-02 — Display tags and type
**GIVEN** a piece with `TagRef(kind="type", value="poem")` and several user tags  
**WHEN** list item is rendered  
**THEN** type badge shows `poem` and up to 2–3 user tags are displayed.

### WL-SCN-03 — Case-insensitive user tag filter
**GIVEN** piece tagged with `TagRef(kind="user", value="Rock")`  
**WHEN** user filters by `rock`  
**THEN** piece matches and remains visible.

### WL-SCN-04 — Combined type + user filter
**GIVEN** active filters `type=text` and user tag `draft`  
**WHEN** list is filtered  
**THEN** only pieces matching both criteria are shown.

### WL-SCN-05 — Empty list state
**GIVEN** repository has zero pieces  
**WHEN** user opens Work List  
**THEN** empty-list state is shown with create/import actions.

### WL-SCN-06 — Empty results after filter
**GIVEN** pieces exist but none match active filters  
**WHEN** filters are applied  
**THEN** no-results state is shown while filters remain active.

### WL-SCN-07 — Song entries visible
**GIVEN** at least one piece of type `song`  
**WHEN** Work List is displayed  
**THEN** song pieces appear with `song` type badge without requiring full song editor behavior in this spec.

---

## Non-Goals (MVP)
- No list-level editing of structured `Piece.content`
- No inline type migration flow from list items
- No dependence on Markdown/source rendering in list
- No bulk operations (multi-delete, multi-export)
- No advanced search/ranking beyond defined filters and default sort
