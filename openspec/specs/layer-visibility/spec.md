# Spec: Layer Visibility

> References: `openspec/domain-model.md`, `openspec/terminology.md`
> Persistence and snapshot rules: `openspec/specs/snapshot-and-layer-state/spec.md`

## Purpose
Allow the user to independently show or hide each annotation layer per piece,
and persist those preferences across sessions.

---

## Layers (fixed — MVP)

There are exactly 5 layers. They always exist and cannot be created, renamed, or deleted.

| LayerKind | AnnotationKind | UI name | Default visible |
|---|---|---|---|
| `chord` | `chord` | Chord | true |
| `meter` | `meter` | Meter | false |
| `breath` | `breath` | Breath | false |
| `intention` | `intent` | Intention | false |
| `comments` | `comment` | Comments | false |

**Each layer is toggled independently.** Activating one layer has no effect on any other.

**Visibility is per-piece**, stored in `PieceSnapshot.layerVisibility`.
There is no global layer state — each piece remembers its own visibility configuration.

---

## Visual rendering per layer

### layer-chord + layer-meter
- When both are visible and two annotations share the same anchorId: one measure box — chord left, meter right.
- When only one is visible: the box shows only that annotation.
- When neither is visible: no box is rendered.

### layer-breath
- Rendered as a small marker inside or adjacent to the anchor zone.
- Displays `S` (short) or `L` (long) in a distinct color.

### layer-intention
- Rendered as a label above the text.
- Vertical offset increases if chord/meter boxes are visible in the same range.
- Can span multiple anchor zones.
- Visually distinct from comments (personal/private style).

### layer-comments
- Rendered as a label above the text, same vertical logic as intention.
- Visually distinct from intention (technical/editorial style).
- Future: AI-generated comments appear here with a distinct AI indicator.

### General rendering rules
- The snapshot HTML always contains ALL annotations regardless of visibility state.
- Layer visibility is controlled exclusively by CSS classes on the container — not by conditional rendering.
- If all layers are hidden, no annotation overlays are painted; base text is unaffected.
- Piece.content is never hidden or modified by layer rendering.
- CSS class toggles must be immediate (zero HTML re-render).
- See `openspec/specs/snapshot-and-layer-state/spec.md` for the full CSS contract.

---

## Use Cases

### UC-LV-01: Toggle Layer Visibility
**Trigger:** User taps the toggle for a layer in the side panel
**Available in:** visualization mode only
**Behavior:**
- Flip the layer's value in PieceSnapshot.layerVisibility
- Add or remove the CSS hide class on the piece container immediately
- Persist updated PieceSnapshot via SnapshotRepository.save()
- Zero HTML re-render — CSS only

**Rule:** Toggling one layer never affects any other layer's visibility.
**Rule:** Does NOT invalidate or regenerate the snapshot HTML.
**Rule:** If the piece has no snapshot yet, layer toggles stay disabled until the first snapshot is ready.

---

### UC-LV-02: Load Layer State for a Piece
**Trigger:** User opens a piece in visualization mode
**Behavior:**
- Load PieceSnapshot via SnapshotRepository.getByPieceId(pieceId)
- If snapshot exists: apply layerVisibility as CSS classes on the container
- If no snapshot exists yet (new piece, never viewed): keep the default values in memory, but keep the layer toggle UI disabled until the first snapshot is generated

---

## Side Panel

- Accessible in visualization mode only
- Shows all 5 layers with UI name and independent visibility toggle
- Layer names are localized (UI language, not piece language)
- Order in panel: Chord, Meter, Breath, Intention, Comments

---

## Non-Goals (MVP)
- No global layer state (per-piece only)
- No custom layer creation
- No layer reordering by the user
- No color customization by the user
- No dynamics layer (future)
