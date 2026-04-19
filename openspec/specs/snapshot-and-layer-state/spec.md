# Spec: Snapshot and Layer State

> References: `openspec/domain-model.md`, `openspec/architecture.md`

## Purpose
Define the contract for PieceSnapshot — the pre-rendered HTML cache used in
visualization mode — including generation, invalidation, layer visibility
persistence, and the CSS mechanism for zero-cost layer toggling.

This spec is the single source of truth for anything related to snapshot
lifecycle and layer state. If there is a conflict between this file and any
other spec, this file wins on these topics.

---

## What is a PieceSnapshot

A PieceSnapshot is a pre-rendered static HTML string of a Piece with all
annotations embedded. It is stored in IndexedDB and loaded directly into
the visualization view without any Angular rendering pipeline.

```ts
interface PieceSnapshot {
  pieceId: string;
  html: string;                              // static HTML, ALL annotations included
  layerVisibility: Record<LayerKind, boolean>; // per-piece layer state
  sourceRevision: number;                    // exact Piece.revision used to generate this snapshot
  generatedAt: string;                       // ISO 8601
}

// Stable layer identifiers used across domain and CSS
type LayerKind = 'chord' | 'meter' | 'breath' | 'intention' | 'comments';
```

Key properties:
- `html` always contains ALL annotations regardless of layer visibility
- `layerVisibility` stores which layers the user has toggled on/off for this piece
- Layer visibility is applied via CSS classes — it never modifies `html`

---

## Generation

### Trigger conditions (eager)
A new snapshot is generated when:
1. The user stops editing for **5 seconds** (debounced inactivity timer)
2. The user exits editing mode (immediate, no wait)
3. The user opens visualization mode and the stored snapshot is stale
4. The user enters editing mode and no snapshot exists yet

All triggers run in the **background** — the user is never blocked.

### Fallback — no snapshot available on open
If the user opens a piece in visualization mode and no snapshot exists yet:
- Display `Piece.content` as plain text immediately (no annotations visible)
- Show a non-blocking message: "Annotations are being processed and will appear shortly"
- Disable annotation actions until the first snapshot is ready
- Disable layer visibility toggles until the first snapshot is ready
- Generate the snapshot in the background
- Once ready, replace the plain text view with the rendered snapshot automatically
- Apply a subtle readiness transition when the first rendered snapshot replaces the base-text state

This is the only case where the user sees the piece without annotations.
It should only happen on the very first open of a newly created piece.

### Fallback — stale snapshot on open
If the user opens a piece in visualization mode and a snapshot exists but
`PieceSnapshot.sourceRevision < Piece.revision`:
- Display the stale snapshot immediately
- Apply persisted `layerVisibility`
- Trigger background regeneration immediately
- Replace the stale snapshot automatically when the fresh one is ready

The user never sees a blank state while a stale snapshot is being refreshed.

### What is generated
The renderer (`core/infrastructure/renderer/piece-renderer.ts`) receives:
- `Piece` (with anchor tags in content)
- `Annotation[]` for that piece

It returns an HTML string where:
- Anchor zones are replaced with rendered annotation elements
- Every annotation element carries CSS classes: `ndf-annotation ndf-layer-{kind}`
  where `{kind}` is the annotation layer kind (`annotation.layerId`)
- Annotations with `status: 'needsReview'` also carry class `ndf-needs-review`
- Base-text fragments that remain selectable in visualization mode carry `data-src-start` and `data-src-end` attributes pointing to raw offsets in `Piece.content`
- The HTML is self-contained — no Angular components, no event listeners

### Immediate overlay update path
When the user adds or resolves an annotation in visualization mode and a snapshot
is already visible:
- Persist the piece/annotation changes immediately
- Inject or update the affected annotation overlay in the current DOM using the same
  CSS class contract
- Keep the current rendered snapshot visible
- Regenerate the full snapshot asynchronously in the background

This keeps feedback instant without waiting for the full render pipeline.

### Generation does NOT happen when
- Layer visibility is toggled (CSS only, no re-render)
- Piece metadata changes (title, type, language, tags)
- The piece is opened in visualization mode and the existing snapshot is current

---

## Invalidation

A snapshot is marked stale and must be regenerated when:
- `Piece.content` changes (UC-PM-04)
- Any `Annotation` of that piece is created, updated, or deleted (UC-AS-01, UC-AS-02, UC-AS-03, UC-AS-04)
- Any `AnchorMark` of that piece is created or deleted (UC-AS-01, UC-AS-03)

Staleness tracking uses both event-driven invalidation and `sourceRevision`:
- `Piece.revision` is incremented on any event above
- A snapshot is stale if `PieceSnapshot.sourceRevision < Piece.revision`

Stale snapshots are regenerated eagerly per the generation rules above.
A stale snapshot is still served to the user until the new one is ready —
there is no blank screen while regenerating.

Snapshot is NOT invalidated by:
- Layer visibility toggle
- Piece metadata changes (title, type, language, tags)

---

## Layer Visibility — CSS Mechanism

### CSS class naming convention
Layer kinds map directly to CSS class names with no duplication:

| LayerKind | Annotation class | Container hide class |
|---|---|---|
| `chord` | `ndf-layer-chord` | `ndf-hide-chord` |
| `meter` | `ndf-layer-meter` | `ndf-hide-meter` |
| `breath` | `ndf-layer-breath` | `ndf-hide-breath` |
| `intention` | `ndf-layer-intention` | `ndf-hide-intention` |
| `comments` | `ndf-layer-comments` | `ndf-hide-comments` |

### HTML structure example
```html
<div class="ndf-piece ndf-hide-meter ndf-hide-breath">
  <span class="ndf-annotation ndf-layer-chord">Am</span>
  <span class="ndf-annotation ndf-layer-meter">2/4</span>
  <span class="ndf-annotation ndf-layer-chord ndf-needs-review">G</span>
</div>
```

### CSS rules
```css
/* Hide layer annotations only when NOT in needsReview state */
.ndf-piece.ndf-hide-chord      .ndf-annotation.ndf-layer-chord:not(.ndf-needs-review)      { display: none; }
.ndf-piece.ndf-hide-meter      .ndf-annotation.ndf-layer-meter:not(.ndf-needs-review)      { display: none; }
.ndf-piece.ndf-hide-breath     .ndf-annotation.ndf-layer-breath:not(.ndf-needs-review)     { display: none; }
.ndf-piece.ndf-hide-intention  .ndf-annotation.ndf-layer-intention:not(.ndf-needs-review)  { display: none; }
.ndf-piece.ndf-hide-comments   .ndf-annotation.ndf-layer-comments:not(.ndf-needs-review)   { display: none; }

/* needsReview annotations are ALWAYS visible regardless of layer toggle */
.ndf-annotation.ndf-needs-review { display: inline; }
```

**Rule:** An annotation with `status: 'needsReview'` is always visible to the user,
even if its layer is toggled off. The warning indicator must never be hidden.

### Toggle flow
1. User taps layer toggle in side panel
2. Angular adds/removes `ndf-hide-{kind}` class on the container — **0ms re-render**
3. `PieceSnapshot.layerVisibility` is updated in memory
4. `SnapshotRepository.save()` persists the updated `layerVisibility` only

### Default layer visibility (new piece, no snapshot yet)
| LayerKind | Default |
|---|---|
| `chord` | true (visible) |
| `meter` | false (hidden) |
| `breath` | false (hidden) |
| `intention` | false (hidden) |
| `comments` | false (hidden) |

---

## Piece.updatedAt on anchor changes

When the annotation system inserts or removes anchor tags from `Piece.content`
(UC-AS-01, UC-AS-03), the piece must be persisted with an updated `updatedAt`.

**Rule:** `updatedAt` reflects the last time the user worked on the piece,
including annotation work. This ensures the work list sort (most recently
updated first) shows the piece the user was most recently annotating at the top.

**Implementation:** any use case that modifies `Piece.content` for anchor
reasons must call `PieceRepository.save()` with the updated `updatedAt`.
This is the responsibility of the use case, not the repository.

## Rendered Recovery Backups

Rendered recovery copies are bounded internal recovery aids for anchor-related ambiguity.
They are NOT version history and they have no dedicated user-facing management UI in MVP.

**Rules:**
- When visualization mode is entered and a rendered snapshot is available to show,
  the snapshot storage layer keeps a rendered recovery copy for that piece
- At most **3** rendered recovery copies are kept per piece
- If a new copy would exceed that limit, the oldest recovery copy is pruned automatically
- Recovery copy storage format is implementation-defined, but each stored copy must
  remain attributable to `pieceId`, `sourceRevision`, and `generatedAt`

---

## Port

```ts
// core/ports/snapshot-repository.port.ts
interface SnapshotRepository {
  getByPieceId(pieceId: string): Promise<PieceSnapshot | null>;
  save(snapshot: PieceSnapshot): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
}
```

Note: `LayerStateRepository` does not exist. Layer state is always accessed
through `SnapshotRepository` via `PieceSnapshot.layerVisibility`.
Rendered recovery copies are also maintained inside the snapshot persistence
adapter in MVP; no separate backup port is introduced until dedicated recovery
UI is specced.

---

## Use Cases

### UC-SS-01: Generate Snapshot
**Trigger:** 5s inactivity timer fires, or user exits editing mode
**Behavior:**
- Load piece and all its annotations
- Ensure any pending integrity-driven `needsReview` persistence for the target `Piece.revision` has completed
- Call renderer: `renderPiece(piece, annotations) → html`
- Load existing snapshot to preserve current `layerVisibility` (or use defaults if none)
- Save new `PieceSnapshot` with updated `html` and `generatedAt`
- Save `sourceRevision` matching `Piece.revision`
- Persist via `SnapshotRepository.save()`
- Always runs in background — never blocks the UI

---

### UC-SS-02: Load Snapshot for Visualization
**Trigger:** User opens a piece in visualization mode
**Behavior:**
- Load `Piece` and `PieceSnapshot`
- If snapshot exists and `snapshot.sourceRevision === piece.revision`:
  - Inject `html` into the view container (no Angular rendering)
  - Apply CSS hide classes based on `layerVisibility`
  - Keep a rendered recovery copy for that visualization entry
- If snapshot exists but `snapshot.sourceRevision < piece.revision`:
  - Inject the stale snapshot into the view container immediately
  - Apply CSS hide classes based on `layerVisibility`
  - Keep annotation actions enabled
  - Trigger background snapshot generation (UC-SS-01)
  - Replace the stale snapshot automatically when the fresh one is ready
  - Keep a rendered recovery copy for that visualization entry
- If no snapshot exists:
  - Display plain `Piece.content` immediately (no annotations)
  - Show a non-blocking loading indicator/message: "Annotations are being processed and will appear shortly"
  - Disable annotation actions until the first snapshot is ready
  - Disable layer visibility toggles until the first snapshot is ready
  - Trigger background snapshot generation (UC-SS-01)
  - When complete, replace plain text with rendered snapshot automatically using a subtle readiness transition

---

### UC-SS-02b: Prime First Snapshot for Editing
**Trigger:** User opens a piece in editing mode and no snapshot exists yet
**Behavior:**
- Trigger background snapshot generation immediately
- Keep annotation actions disabled until the first snapshot is ready
- Continue allowing normal text editing while the snapshot is generated

---

### UC-SS-03: Invalidate Snapshot on Change
**Trigger:** Any of the following:
- `Piece.content` changes (UC-PM-04)
- Any `Annotation` is created, updated, or deleted (UC-AS-01, UC-AS-02, UC-AS-03, UC-AS-04)
- Any `AnchorMark` is created or deleted (UC-AS-01, UC-AS-03)

**Behavior:**
- Leave the existing snapshot untouched and rely on the revision comparison rule (`sourceRevision < Piece.revision`) to treat it as stale
- Start or reset the 5s inactivity debounce timer
- The user continues working — no interruption

---

### UC-SS-04: Delete Snapshot
**Trigger:** Piece is deleted (UC-PM-06)
**Behavior:**
- `SnapshotRepository.deleteByPieceId(pieceId)`

---

## Renderer Contract

```ts
// core/infrastructure/renderer/piece-renderer.ts
function renderPiece(piece: Piece, annotations: Annotation[]): string
```

Rules:
- Pure function — no side effects, no Angular, no IndexedDB
- Receives piece with anchor tags in content
- Replaces anchor zones with annotation HTML elements using CSS classes per the naming convention above
- All annotations always rendered (visibility handled by CSS, not renderer)
- Annotations with `status: 'needsReview'` receive class `ndf-needs-review`
- Base-text spans intended to remain user-selectable in visualization mode expose `data-src-start` / `data-src-end` attributes so DOM selections can be mapped back to raw `Piece.content`
- Overlay annotation elements must remain outside the selectable text flow
- Can be unit tested in isolation

Minimal chord + meter structure:
```html
<span class="ndf-anchor-box">
  <span class="ndf-slot ndf-slot-left">
    <span class="ndf-annotation ndf-layer-chord">Am</span>
  </span>
  <span class="ndf-slot ndf-slot-right">
    <span class="ndf-annotation ndf-layer-meter">2/4</span>
  </span>
</span>
```

Additional rules for this structure:
- Use simple `span`-based HTML; layout is defined by CSS, not by renderer branching
- When both chord and meter exist for the same anchor, chord occupies the left slot and meter the right slot
- When only one exists, the remaining slot collapses naturally via CSS

---

## Non-Goals (MVP)
- No snapshot versioning or diff
- No partial snapshot updates (always full regeneration)
- No background Web Worker for rendering (future optimisation if needed)
- No user-configurable generation timing (future: on-exit / 5s / 2s)
