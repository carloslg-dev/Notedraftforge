# NoteDraftForge — Epic and Issue Backlog

> This file is the ordered starting point for implementation.
> Each epic maps to one or more feature specs.
> Issues are created from this backlog using `openspec/templates/issue-template.md`.

---

## Implementation order

Build in this sequence. Each epic can start only when its dependencies are done.

```
E-01 Foundation
  └─ E-02 Domain model
       ├─ E-03 Piece Management + Work List
       ├─ E-04 Editor Modes
       ├─ E-05 Annotation System
       └─ E-06 Snapshot & Layer State
```

---

## E-01 — Foundation

**Depends on:** nothing
**Spec:** `openspec/architecture.md`

Establish the Angular project structure, module layout, and infrastructure contracts.
Nothing else can be built without this.

| Issue | Scope |
|---|---|
| Angular project bootstrap | Create app with routing, module layout, folder structure per architecture doc |
| Shared types and constants | Layer definitions (compile-time), PieceType enum, CSS class constants |
| Port interfaces | `PieceRepository`, `AnchorRepository`, `AnnotationRepository`, `SnapshotRepository` |
| IndexedDB adapter stubs | Implement all four ports with IndexedDB; basic CRUD, no business logic |
| Error handling baseline | Toast/banner service; error policy per `openspec/non-functional.md` |
| Architecture lint rules | ESLint rules to enforce import boundaries (domain → nothing external) |

---

## E-02 — Domain model

**Depends on:** E-01
**Spec:** `openspec/domain-model.md`

Implement all domain entities, value objects, and domain rules as pure TypeScript.
No Angular, no IndexedDB, no side effects. Unit-testable in isolation.

| Issue | Scope |
|---|---|
| `Piece` entity | Type, rules, `revision` increment, `updatedAt`, tag/type invariants |
| `AnchorMark` entity | Type, id format validation (`/^a\d+$/`), cascade rules |
| `Annotation` entity | Type, `AnnotationContent` union, kind/layer assignment rule, status |
| `ChordContent` rules | Root validation, modifier ordering, `display` derivation |
| Domain invariants | Unit tests for all 11 invariants in `domain-model.md` |

---

## E-03 — Piece Management + Work List

**Depends on:** E-01, E-02
**Specs:** `openspec/specs/piece-management/spec.md`, `openspec/specs/work-list/spec.md`

Piece CRUD, import/export, and the work list UI. No annotation interactions here.

| Issue | Scope |
|---|---|
| Create piece use case | Input validation, id generation, type-as-tag rule, persist via port |
| Update piece metadata | Title, type, language, tags; update `updatedAt`; type-as-tag enforcement |
| Delete piece use case | Cascade delete annotations and anchors via ports |
| Export piece to Markdown | Strip anchor tags with regex; clean `.md` output |
| Import Markdown file | Parse text-oriented Markdown; degrade unsupported structures (D-05) |
| Work list component | List all pieces, sort by `updatedAt` desc |
| Filter by tags | Unified type/tag filter model (D-08); badge + tag display |
| Navigation to work | Route from work list to work view |

---

## E-04 — Editor Modes

**Depends on:** E-01, E-02, E-03
**Spec:** `openspec/specs/editor-modes/spec.md`

Mode system (visualization / editing), FABs, transitions, and mode-based restrictions.
No annotation management or snapshot generation here — only the mode container.

| Issue | Scope |
|---|---|
| Mode state service | Visualization / editing state, transitions, restrictions per mode |
| Work view component (shell) | Container that switches between visualization and editing sub-views |
| Editing mode — content editor | Markdown editor, anchor tags hidden from user, autosave debounce (800ms) |
| Content autosave use case | Debounce, persist `Piece.content`, increment `revision`, `updatedAt` update |
| Global FAB | Context-aware floating action button per mode |
| Contextual FAB | Annotation-add trigger in visualization mode (disabled until snapshot ready) |
| Double-action protection | `isProcessing` flag or `exhaustMap` on all action triggers |

---

## E-05 — Annotation System

**Depends on:** E-01, E-02, E-04
**Spec:** `openspec/specs/annotation-system/spec.md`

Creating, editing, deleting annotations and managing anchor integrity.

| Issue | Scope |
|---|---|
| Create annotation use case | Reuse or create anchor, persist annotation, immediate visual feedback in viz mode (D-03) |
| Edit annotation use case | Update content, recompute `display` for chords, persist |
| Delete annotation use case | Remove annotation (and anchor if no other annotations reference it) |
| Anchor integrity pass | Run after content save; mark `needsReview` on boundary ambiguity (D-02) |
| Resolve `needsReview` use case | User confirms anchor still valid; resets status to `valid` |
| Annotation UI in visualization mode | Display annotations per anchor zone; `needsReview` always visible |
| Layer visibility in annotation rendering | CSS classes per layer kind; `ndf-needs-review` override |

---

## E-06 — Snapshot & Layer State

**Depends on:** E-01, E-02, E-04, E-05
**Spec:** `openspec/specs/snapshot-and-layer-state/spec.md`

Snapshot generation pipeline, stale detection, fallback behavior, and layer toggling.

| Issue | Scope |
|---|---|
| Piece renderer | Pure function: `Piece + Annotation[]` → HTML string; CSS classes per layer and status |
| Snapshot generation use case | Generate `PieceSnapshot`, set `sourceRevision`, persist via port |
| Snapshot invalidation service | Detect stale snapshots (`sourceRevision < revision`); trigger regeneration |
| Snapshot inactivity debounce | 5s debounce in editing mode; immediate generation on exit |
| Load snapshot in visualization | Load + inject HTML; stale → inject current + regenerate in background |
| No-snapshot fallback | Show base text (read-only), disable annotation actions, generate first snapshot (D-04) |
| Toggle layer visibility | Update `layerVisibility`, apply CSS class on container, persist; zero re-render |
| Recovery copies | Store up to 3 rendered copies per piece; prune oldest automatically (D-02) |

---

## Decision references

| Decision | Impacts |
|---|---|
| D-01 Editing persistence contract | E-04 (autosave), E-06 (snapshot debounce) |
| D-02 Anchor integrity strategy | E-05 (needsReview), E-06 (recovery copies) |
| D-03 Add annotation in viz mode | E-05 (immediate feedback), E-06 (background regen) |
| D-04 No-snapshot fallback | E-06 (fallback behavior) |
| D-05 Import policy | E-03 (import) |
| D-06 Error policy | E-01 (error handling baseline) |
| D-07 needsReview latency tolerance | E-05 (integrity pass) |
| D-08 Type/tag model | E-03 (work list filter) |
| D-09 Chord/meter renderer contract | E-06 (renderer) |
