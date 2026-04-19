# Spec: Editor Modes

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Define the two modes for viewing and editing a Piece, and the rules governing what is allowed in each.

---

## Modes (MVP)

There are exactly **two modes** in the MVP:

| Mode | User intent | Text editable | Annotations |
|---|---|---|---|
| `visualization` | reading, performing, adding interpretation | No (locked) | Add + resolve needsReview |
| `editing` | writing, revising content | Yes | Full management |

> Note: `analysis` and `rehearsal` mentioned in earlier drafts are **not MVP modes**. They are future named layer-visibility presets, not distinct modes.

---

## Visualization Mode

### Entry
- Default mode when opening a piece from the Works List

### Behavior
- `Piece.content` is rendered as read-only (no cursor, no text input)
- Visible layers are rendered as overlays on the text
- Auto-scroll is available (start/stop, fixed speed)
- User can select a text range to add a new annotation (UC-AS-01)
- In visualization mode, that selection is mapped back to raw `Piece.content` using source offsets emitted by the snapshot renderer
- If no snapshot exists yet, visualization starts in a temporary base-text state and annotation actions stay disabled until the first snapshot is ready
- If a snapshot is already visible, annotations added or resolved here must show immediate overlay feedback while full snapshot regeneration continues in the background

### Allowed actions
- Toggle layer visibility (side panel)
- Add annotation via text selection → Contextual FAB
- Resolve `needsReview` annotations (UC-AS-04)
- Start / stop auto-scroll
- Switch to editing mode

Condition:
- In the temporary no-snapshot state, all annotation actions are disabled until snapshot generation completes.
- In the temporary no-snapshot state, layer visibility toggles are also disabled until the first snapshot is ready.
- When the first snapshot becomes available, the view transitions subtly from base text to the interactive rendered visualization.

### Forbidden actions
- Modify `Piece.content` directly (user text editing is locked)
- Edit annotation content, kind, or layer
- Delete existing annotations

Note: the system may insert anchor tags into `Piece.content` when the user
adds an annotation in visualization mode. This is a system-level operation,
not a user text edit, and is permitted.

---

## Editing Mode

### Entry
- User taps "edit" button from visualization mode
- User is navigated directly here after creating a new piece (UC-PM-01)

### Behavior
- `Piece.content` is fully editable (Markdown editor)
- Anchor integrity is checked in real time as content changes (UC-AS-06)
- Annotation records are manageable, but interpretation layers are not rendered as live overlays in editing mode
- If no snapshot exists when editing mode is entered, the first snapshot is generated in the background and annotation actions stay disabled until it is ready

### Allowed actions
- Edit `Piece.content`
- Add annotation (UC-AS-01) only when a snapshot already exists
- Edit annotation content (UC-AS-02) only when a snapshot already exists
- Delete annotation (UC-AS-03) only when a snapshot already exists
- Resolve `needsReview` annotations (UC-AS-04) only when a snapshot already exists
- Update piece metadata (title, type, language, tags) — UC-PM-05
- Switch to visualization mode

### Forbidden actions
- Auto-scroll (not available in editing mode)
- Layer visibility toggles (layers are not shown in editing mode)

---

## Mode Transition Rules

| From | To | Trigger | Side effects |
|---|---|---|---|
| Works List | Visualization | User taps a piece | Load piece + annotations |
| Visualization | Editing | User taps "Edit" button | None; content stays as-is |
| Editing | Visualization | User taps "View" / "Done" | Persist any unsaved changes first |
| Any mode | Works List | User taps "Back" / "Close" | Persist any unsaved changes first |

**Rule:** Unsaved changes are never lost silently. Any navigation away from editing mode must trigger a persist before leaving. There is no explicit "save" button — persistence is automatic.

---

## Contextual FAB (selection-based)

Appears when the user selects a text range. Available in both modes.

| Action | Available in visualization | Available in editing |
|---|---|---|
| Add annotation (all kinds) | Yes, only when a snapshot exists | Yes, only when a snapshot exists |

The kind selection within the FAB determines the layer automatically.
No separate "assign layer" action exists — kind and layer are always 1:1.

---

## Global FAB

Always visible regardless of mode.

| Action | Behavior |
|---|---|
| Create | UC-PM-01 |
| Import .md | UC-PM-07 |

Export is available from within an open piece (UC-PM-08), not from the Global FAB.
Multi-piece export from the Work List is a future feature (not MVP).

---

## Auto-scroll

- Available in **visualization mode only**
- Speed: single fixed speed in MVP (no configuration)
- Controls: start / stop toggle
- Auto-scroll does not affect the Piece or any data

---

## Non-Goals (MVP)
- No `analysis` mode
- No `rehearsal` mode
- No per-piece mode memory (always opens in visualization)
- No split-view (visualization + editing simultaneously)
- No configurable auto-scroll speed
