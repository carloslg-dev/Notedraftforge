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

Establish the React project structure, module layout, and infrastructure contracts.
Nothing else can be built without this.

| Issue | Status | Scope |
|---|---|---|
| React project bootstrap (Vite + React 18 + Tiptap) | **Done (#1)** | Create app with routing, folder structure per architecture doc; Tailwind CSS + shadcn/ui setup (D-16, D-18) |
| Shared types and constants | **Done (#2)** | Layer definitions (compile-time), PieceType enum, CSS class constants |
| Port interfaces | **Done (#3)** | `PieceRepository`, `AnnotationRepository`, `SnapshotRepository` |
| IndexedDB adapter stubs (Dexie) | **Done (#4)** | Implement all three ports with Dexie; basic CRUD, no business logic (D-21) |
| Zustand UI state setup | **Done (#5)** | Global UI state store: modal state, selection state, active mode (D-19) |
| Error handling baseline | **Done (#6)** | Toast/banner component; error policy per `openspec/non-functional.md` |
| Architecture lint rules | **Done (#7)** | ESLint rules to enforce import boundaries (domain → nothing external) |

---

## E-02 — Domain model

**Depends on:** E-01  
**Spec:** `openspec/domain-model.md`  

Implement all domain entities, value objects, and domain rules as pure TypeScript.
No React, no IndexedDB, no side effects. Unit-testable in isolation.

| Issue | Status | Scope |
|---|---|---|
| `Piece` entity | **Done (#8)** | Type, rules, `revision` increment, `updatedAt`, tag/type invariants |
| `Annotation` entity | **Done (#9)** | `AnnotationContent` union (`BreathContent`, `NoteAnnotationContent`), kind/layer assignment rule, status (D-23) |
| `ChordContent` rules | **Done (#10)** | Root validation, modifier ordering, `display` derivation |
| Domain invariants | **Done (#11)** | Unit tests for all invariants in `domain-model.md` |

---

## E-03 — Piece Management + Work List

**Depends on:** E-01, E-02  
**Specs:** `openspec/specs/piece-management/spec.md`, `openspec/specs/work-list/spec.md`  

Piece CRUD, Markdown import/export adapters, JSON backup/restore, and the work list UI. No annotation interactions here.

| Issue | Status | Scope |
|---|---|---|
| Create piece use case | **Done (#12)** | Input validation, id generation, type-as-tag rule, persist via port; domain supports `song`, MVP UI offers `text`/`poem` only |
| Update piece metadata | **Done (#13)** | Title, language, user tags; update `updatedAt`; type remains immutable in MVP except through a future migration flow |
| Delete piece use case | **Done (#14)** | Cascade delete annotations, snapshots, and other piece-scoped artifacts via ports |
| Export piece to Markdown | **Done (#15)** | Map structured content to clean `.md`; no internal metadata (PM-REQ-10) |
| Import Markdown file | **Done (#16)** | Parse text-oriented Markdown; degrade unsupported structures (D-05) |
| Work list component | **Done (#17)** | List all pieces, sort by `updatedAt` desc |
| Filter by tags | **Done (#18)** | Unified type/tag filter model (D-08); badge + tag display; MVP user-facing type filters expose `text`/`poem` only |
| Tag search overlay | **Done (#19)** | "···" chip → real-time search overlay; empty state; no flat list (WL-REQ-11) |
| Navigation to work | **Done (#20)** | Route from work list to work view |
| JSON backup export | **Done (#21)** | Full JSON export of all pieces + annotations + required layer visibility state; download as `.json` before version updates (PM-REQ-11, D-22) |
| JSON backup restore | **Done (#75)** | Paste or upload JSON; Zod validation; reject inconsistent piece type metadata; replace-all with warning while preserving layer visibility (PM-REQ-12, D-20, D-22, D-24) |

---

## E-04 — Editor Modes

**Depends on:** E-01, E-02, E-03  
**Spec:** `openspec/specs/editor-modes/spec.md`  

Mode system (visualization / editing), selection toolbar, refinement modal, transitions, and mode-based restrictions.
No annotation management or snapshot generation here — only the mode container, editor actions, and mode restrictions.

| Issue | Status | Scope |
|---|---|---|
| Mode state (Zustand) | **Done (#23)** | Visualization / editing state, transitions, restrictions per mode |
| Work view component (shell) | **Done (#24)** | Container that switches between visualization and editing sub-views |
| Editing mode — Tiptap editor | **Done (#25)** | Tiptap OSS adapter, structured content mapping, autosave debounce 800ms (D-15) |
| Content autosave use case | **Done (#26)** | Debounce, persist `Piece.content`, increment `revision`, `updatedAt` update |
| Selection toolbar component | **Done (#27)** | Contextual toolbar above selection; edit mode format actions (`bold`, `italic`, `underline`) / visualization mode annotation kinds; frosted white theme (EM-REQ-05, D-24) |
| Selection Refinement modal | **Done (#28)** | Char-by-char boundary adjuster, 8-char context window, nudge ←→, confirm (EM-REQ-06) |
| Language preference UI | **Done (#29)** | ES / EN segmented control in app header; persisted in UI state; does not infer or mutate `Piece.language` |
| Settings placeholder | **Done (#30)** | Settings button in app header; no-op in MVP; reserved space for future settings |
| Double-action protection | **Done (#31)** | `isProcessing` flag or debounce on all action triggers |

---

## E-05 — Annotation System

**Depends on:** E-01, E-02, E-04  
**Spec:** `openspec/specs/annotation-system/spec.md`  

Creating, editing, deleting annotations and managing target integrity.

| Issue | Status | Scope |
|---|---|---|
| Create annotation use case | **Done (#32)** | Validate target, persist annotation, immediate visual feedback in viz mode (D-03, AS-REQ-07) |
| Annotation modal component | **Done (#33)** | Type selector (breath/intent/comment) → mark selector or shortNote + extendedNote fields (D-23, AS-REQ-06) |
| Edit annotation use case | **Open (#34)** | Update content, validate, persist (AS-REQ-08) |
| Delete annotation use case | **Done (#35)** | Remove annotation, update piece revision (AS-REQ-09) |
| Target integrity pass | **Open (#36)** | Run after content save; mark `needsReview` on unresolvable target (D-02, AS-REQ-10) |
| Resolve `needsReview` use case | **Deferred (#37)** | User confirms, retargets, or deletes; explicit flow only (AS-REQ-11) (Deferred / Backlog) |
| Annotation rendering in visualization | **Done (#38)** | shortNote floating above text (Caveat font); extendedNote in sidebar on selection; `needsReview` always visible |
| Layer visibility in annotation rendering | **Done (#39)** | CSS classes per layer kind; `ndf-needs-review` override |

---

## E-06 — Snapshot & Layer State

**Depends on:** E-01, E-02, E-04, E-05  
**Spec:** `openspec/specs/snapshot-and-layer-state/spec.md`  

Snapshot generation pipeline, stale detection, fallback behavior, and layer toggling.

| Issue | Status | Scope |
|---|---|---|
| Piece renderer | **Done (#40)** | Pure function: `Piece + Annotation[]` → HTML string; CSS classes per layer and status |
| Snapshot generation use case | **Open (#41)** | Generate `PieceSnapshot`, set `sourceRevision`, persist via port |
| Snapshot invalidation service | **Open (#42)** | Detect stale snapshots (`sourceRevision < revision`); trigger regeneration; keep annotation actions disabled until current snapshot is ready |
| Snapshot inactivity debounce | **Open (#43)** | 5s debounce in editing mode; immediate generation on exit |
| Load snapshot in visualization | **Open (#44)** | Load + inject HTML; stale → inject current + regenerate in background |
| No-snapshot fallback | **Open (#45)** | Show base text (read-only), disable annotation actions, generate first snapshot (D-04) |
| Toggle layer visibility | **Done (#46)** | Update `layerVisibility`, apply CSS class on container, persist; zero re-render |
| ~~Recovery copies~~ | **Deferred** | Deferred to MVP2 — recovery-copy lifecycle will be designed once annotation-integrity flows are validated in practice (D-02) |

---

## E-07 — Deployment & Configuration

**Depends on:** E-01, E-03, E-04, E-06  
**Spec:** `openspec/architecture.md`  

Production deployment setup to host NoteDraftForge on GitHub Pages as a static, client-side offline app.

| Issue | Status | Scope |
|---|---|---|
| Configure GitHub Pages deployment pipeline | **Done (#79)** | Configure Vite repository URL base path (`vite.config.ts`); switch `BrowserRouter` to `HashRouter` in `App.tsx` to handle static direct URLs without 404 errors; create GitHub Actions deployment workflow `.github/workflows/deploy.yml` triggered on push to `main`. |
| Real Dexie DB transactions and schema | **Done (#73)** | Implement full transactional safety in Dexie adapter and strict schema parsing boundaries. |

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
| D-10 Structured content model | E-02 (domain), E-03, E-05 |
| D-11 Dual annotation target system | E-02 (domain), E-05 |
| D-12 Anchor tags not source of truth | E-02, E-05 |
| D-13 Structured song model | E-02, E-06 (renderer) |
| D-14 Markdown as import/export format | E-03 (import/export), E-04 |
| D-15 Tiptap OSS editor adapter | E-04 (editor) |
| D-16 React frontend | E-01 (bootstrap) |
| D-17 Structured TagRef model | E-02, E-03 (work list filter) |
| D-18 Tailwind CSS + shadcn/ui | E-01 (setup) |
| D-19 Zustand for UI state | E-01 (setup), E-04 (mode state) |
| D-20 Zod for boundary validation | E-03 (restore import) |
| D-21 Dexie for IndexedDB | E-01 (adapter stubs) |
| D-22 JSON backup format | E-03 (export/restore issues) |
| D-23 shortNote/extendedNote content model | E-02 (domain), E-05 (annotation modal) |
| D-24 MVP clarification batch | E-02, E-03, E-04, E-06 |
