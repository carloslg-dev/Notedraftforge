# Spec: Annotation System

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Allow the user to attach structured annotations to anchor-based text zones (AnchorMarks)
within a Piece, grouped by independent fixed layers, with automatic integrity maintenance
when the Piece content is edited.

---

## Use Cases

### UC-AS-01: Add Annotation
**Trigger:** User selects a text range and taps "add annotation" in the Contextual FAB
**Available in:** both visualization mode and editing mode, only after the piece has at least one generated snapshot

#### Step 1 — Kind selection (Contextual FAB)
The FAB shows the 5 annotation kinds as tappable options:
- `Chord`
- `Meter`
- `Breath`
- `Intention`
- `Comment`

The user selects a kind. This determines which modal form is shown.

#### Step 2 — Anchor resolution
Before opening the modal, the system checks the selected text range:

- **If the range exactly matches an existing AnchorMark:** reuse that anchor.
  No new anchor tag is inserted into `Piece.content`.
- **If no AnchorMark exists for that range:** reserve a provisional anchor plan
  for the selected range. The system prepares the new `AnchorMark.id` and
  insertion points in memory, but does NOT modify `Piece.content` or persist
  anything until the user saves the annotation.
- **Empty range (start === end):** valid — creates a punctual anchor
  (e.g. for instrumental measures with no lyrics: `<!--a2s--><!--a2e-->`).

**Note on visualization mode:** inserting anchor tags modifies `Piece.content`
but this is a **system-level operation**, not a user text edit. The rule
"text cannot be modified in visualization mode" refers to direct user editing
of the text. System anchor insertion is permitted in both modes.

#### Selection-to-source mapping contract
The annotation system always works with offsets over raw `Piece.content`.

- In editing mode, the Markdown editor provides those offsets directly.
- In visualization mode, the selection is resolved from the rendered snapshot DOM.
- The snapshot renderer must emit selectable base-text fragments with:
  - `data-src-start`: inclusive raw offset in `Piece.content`
  - `data-src-end`: exclusive raw offset in `Piece.content`
- Overlay annotation elements must be non-selectable and must not contribute to the mapped range.
- Anchor tags themselves have no selectable footprint in visualization mode; the mapping skips over them and resolves to the surrounding raw content offsets.

**Rule:** `UC-AS-01` receives a normalized `{start, end}` pair over raw `Piece.content`
before applying anchor reuse or anchor creation logic.

**Availability rule:** if the piece has no generated snapshot yet, add-annotation entry points stay disabled in both modes until the first snapshot is ready.

#### Step 3 — Annotation modal

**Layout rules:**
- Mobile: bottom sheet, leaves selected text visible above when possible
- Desktop: overlay so selected text remains visible below; pushes content down if near top
- Tapping/clicking outside does nothing (no accidental dismiss)
- Two explicit actions: **Save** and **Close**
- Closing without saving discards silently (user chose Close explicitly)
- Closing without saving also discards any provisional anchor plan created in Step 2

**Modal — Chord:**
- Root selector: tag buttons `A B C D E F G`, one at a time
- Modifier toggles:
  - Alteration (mutually exclusive): `#` (sharp) / `b` (flat)
  - Mode (mutually exclusive): `m` (minor) / `M` (major)
  - Extension: `7` (seventh)
- Live preview of composed chord (e.g. `C#m7`), updates as user taps
- Manual text fallback: if parseable into root + modifiers → stored as structured; if not → inline error
- Future (post-MVP): "Recent chords in this piece" quick-select section

**Modal — Meter:**
- Text input for rhythmic value (e.g. `4/4`, `3/4`, `2/4`), non-empty required

**Modal — Breath:**
- Two large tap targets: `S` (Short) / `L` (Long)
- Always user-chosen — no automatic suggestion

**Modal — Intention:**
- Multiline text input, non-empty required
- Note: "This is personal — only you can see and write here"

**Modal — Comment:**
- Multiline text input, non-empty required

**Layer assignment:**
The layer is fixed per kind — the modal shows no layer picker.
Kind → layer mapping is defined in domain-model.md.

#### Step 4 — Save
- Validate all inputs (see below)
- Generate UUID for annotation `id`
- Set `anchorId` from the reused anchor or provisional anchor prepared in Step 2
- Set `layerId` from kind (fixed mapping)
- Set `status` to `valid`
- If kind is `chord`: compute and store `display`
- If a provisional anchor plan exists:
  - Insert `<!--{id}s-->` and `<!--{id}e-->` into `Piece.content`
  - Persist the new anchor via `AnchorRepository.save()`
- Refresh `Piece.updatedAt`
- Increment `Piece.revision`
- Persist the updated `Piece` via `PieceRepository.save()`
- Persist via `AnnotationRepository.save()`
- Mark `PieceSnapshot` as stale → trigger regeneration
- If the current view is visualization mode and a rendered snapshot is already visible:
  - inject the new annotation as an immediate overlay on top of the current DOM
  - keep the current snapshot visible while full regeneration runs in the background
- Close modal
- Render new annotation immediately in the current view

**Persistence rule (MVP):**
- This flow uses best-effort sequential persistence across `Piece`, `AnchorMark`, and `Annotation`
- No cross-repository rollback is required in MVP
- If a later persist step fails, the UI shows a visible error, the already-persisted state is left unchanged, and the next automatic persistence cycle retries the remaining saves

**Validation:**
- `anchorId` must reference a valid `AnchorMark` in the same piece
- `chord`: `root` required, modifiers valid per domain rules
- `meter`: non-empty string
- `breath`: must be `S` or `L`
- `intent`: non-empty string
- `comment`: non-empty string

---

### UC-AS-02: Edit Annotation
**Available in:** editing mode only
**What can be edited:** `content` only. `kind` is immutable after creation — if a different kind is needed, delete and create a new annotation.
**Behavior:**
- Open annotation modal pre-populated with existing content value
- Apply changes on Save
- Re-validate content per kind rules
- If kind is `chord` and root or modifiers changed: recompute and store `display`
- Refresh `Piece.updatedAt`
- Increment `Piece.revision`
- Persist the updated `Piece` via `PieceRepository.save()`
- Update via `AnnotationRepository.save()`
- Mark `PieceSnapshot` as stale → trigger regeneration
- `needsReview` status is NOT reset by editing — must be resolved via UC-AS-04

---

### UC-AS-03: Delete Annotation
**Available in:** editing mode only
**Behavior:**
- Delete via `AnnotationRepository.delete(id)`
- If the deleted annotation was the last one referencing its `AnchorMark`:
  - Remove the anchor tags from `Piece.content`
  - Delete the `AnchorMark` via `AnchorRepository.delete(anchorId)`
- Refresh `Piece.updatedAt`
- Increment `Piece.revision`
- Persist the updated `Piece` via `PieceRepository.save()`
- Mark `PieceSnapshot` as stale → trigger regeneration

---

### UC-AS-04: Resolve needsReview Annotation
**Trigger:** User taps a needsReview annotation
**Available in:** both visualization mode and editing mode, only after the piece has at least one generated snapshot

**Rationale:** users can add annotations from visualization mode, so resolving
system-invalidated annotations there is consistent — no mode switch required.

**Options:**
- **Confirm:** the current anchor position is acceptable → set `status` to `valid`
- **Re-anchor:** user selects a new text range → create or reuse an `AnchorMark`
  at the new range, update `anchorId`, set `status` to `valid`
- **Delete:** remove the annotation (and its anchor if no other annotations reference it)

**Rule:** No automatic resolution. The user must act explicitly.
**Rule:** Every resolve action refreshes `Piece.updatedAt`, increments `Piece.revision`,
persists the affected entities, and invalidates the snapshot.
**Rule:** Confirm and re-anchor persist the updated annotation via `AnnotationRepository.save()`.
**Rule:** If re-anchor creates or removes anchor tags in `Piece.content`, persist
the updated `Piece` via `PieceRepository.save()`. If the previous anchor becomes
unreferenced after the move, remove its tags and delete it.
**Rule:** In visualization mode with an existing rendered snapshot, confirm and
re-anchor actions update the current view immediately; full snapshot regeneration
continues asynchronously in the background.

---

### UC-AS-05: Toggle Layer Visibility
**Trigger:** User taps the toggle for a layer in the side panel
**Available in:** visualization mode only
**Behavior:**
- Flip the layer's value in `PieceSnapshot.layerVisibility`
- Add or remove the corresponding CSS hide class on the piece container
- Persist updated `PieceSnapshot.layerVisibility` via `SnapshotRepository.save()`
- Zero HTML re-render — CSS only

**Rule:** Does NOT invalidate or regenerate the snapshot HTML.

---

### UC-AS-06: Maintain Anchor Integrity on Content Edit
**Trigger:** `Piece.content` changes in editing mode
**Behavior:** After each edit, the system evaluates anchor integrity with a conservative
boundary-focused heuristic.

#### Integrity check
For anchors affected by the edited range:
- Verify both `<!--{id}s-->` and `<!--{id}e-->` are still present in `Piece.content`
- Verify start tag appears before end tag
- If the edit clearly stays inside the anchor body and both boundary tags remain valid,
  keep the annotation state unchanged
- If a boundary tag is missing, out of order, or the system can no longer trust the
  original boundary, mark all annotations referencing that `anchorId` as `status: 'needsReview'`
- Do NOT automatically remove or repair the anchor tags

Anchors clearly outside the edited zone are left untouched.

#### Persistence and ordering
- All annotations newly moved to `status: 'needsReview'` must be persisted via `AnnotationRepository.save()`
- These derived status updates belong to the same content-change cycle that triggered the integrity check
- The content change already incremented `Piece.revision`; integrity-driven `needsReview` updates for that same cycle do **not** increment it a second time
- Any snapshot regeneration for that content-change cycle must wait until the corresponding `needsReview` persists have completed

**Rule:** The integrity check may complete with a short delay if needed to keep typing
responsive, but the final `needsReview` state must appear in place without requiring
navigation or manual refresh.

---

## needsReview Lifecycle

| State | How entered | How exited |
|---|---|---|
| `valid` | on creation | stays valid unless anchor is corrupted |
| `needsReview` | anchor tag corrupted by edit | user confirms, re-anchors (→ valid), or deletes |

**UI rule:** `needsReview` annotations must be visually distinct (warning indicator).
Never silently hidden. Visible in both modes.
Only true boundary ambiguity should move an annotation into `needsReview`; edits that
leave anchor boundaries intact must not be invalidated conservatively.

---

## Double-Action Protection

All annotation actions (save, delete, resolve) must be protected against duplicate
execution from double-taps or rapid clicks.

**Rule:** Use an `isProcessing` flag or RxJS `exhaustMap` on all action triggers.
A second trigger while an action is in progress is silently ignored.
No duplicate modals, no duplicate persists.

---

## Non-Goals (MVP)
- Anchor tag offsets are calculated on raw Markdown source, not on rendered HTML — the rendered HTML is not the source of truth for text positions
- Exported `.md` files never contain annotations or anchor tags — only clean Markdown
- No overlapping annotation conflict detection
- No annotation history or versioning
- No custom layer creation
- No exportable annotations in structured format (JSON, XML, etc.)
- No `dynamics` kind (future)
- No AI-generated `intent` annotations (AI may only write `comment`, future)
- No automatic S/L suggestion for `breath` — always user-chosen
