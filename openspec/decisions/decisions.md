# NoteDraftForge — Decisions Log

## Purpose

This file records cross-spec decisions made before ticket breakdown and implementation.
It exists to keep architectural and product decisions traceable across chats and contributors.

## Status values

- `Pending`: identified but not yet resolved
- `In analysis`: actively being discussed
- `Decided`: agreed at decision level
- `Transferred`: explicitly reflected in project documentation/specs

---

## Decision Register

### D-01 — Editing persistence contract
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Content persistence and snapshot generation are decoupled. Content is saved with efficient autosave during editing; snapshot generation runs after inactivity, on exit from editing, and on open if stale. Persistence and snapshot/render generation must be implemented behind ports/adapters.
- **Working defaults (MVP):**
  - Content autosave debounce: `800ms`
  - Snapshot generation inactivity debounce: `5s`
- **Impacts:** Piece Management, Editor Modes, Snapshot & Layer State, Architecture
- **Transfer status:** Transferred

### D-02 — Anchor integrity strategy (MVP)
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Use a conservative strategy: prioritize recovery and low false invalidation. Keep `AnchorMark` as canonical link, and mark `needsReview` only on true boundary ambiguity.
- **Additional direction:** Maintain up to 3 rendered recovery copies per piece when entering visualization, and prune the oldest copy automatically when the limit is exceeded.
- **Impacts:** Annotation System, Snapshot & Layer State, Editor Modes, Architecture
- **Transfer status:** Transferred

### D-03 — Add annotation in visualization mode
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Persist annotation immediately and show visual feedback instantly on top of current visualization. Full snapshot regeneration remains asynchronous in background.
- **Impacts:** Annotation System, Editor Modes, Snapshot & Layer State, Architecture
- **Transfer status:** Transferred

### D-04 — No-snapshot fallback behavior
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** If no snapshot exists, show base text immediately in non-editable mode, generate first snapshot in background, and enable annotation interactions only when first snapshot is ready.
- **Impacts:** Snapshot & Layer State, Editor Modes, Visualization UX
- **Transfer status:** Transferred

### D-05 — Import policy (MVP)
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Import focuses on text-oriented Markdown. Unsupported complex structures may be cleaned/degraded for MVP consistency.
- **Impacts:** Piece Management, Import flow
- **Transfer status:** Transferred

### D-06 — Error policy (MVP)
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Keep error handling simple and non-blocking (toast/banner level), sufficient for personal use in MVP.
- **Impacts:** UX baseline, Infrastructure adapters
- **Transfer status:** Transferred

### D-07 — needsReview latency tolerance
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** A short delay is acceptable if user feedback in the view remains immediate and understandable.
- **Impacts:** Annotation integrity flow, Rendering feedback
- **Transfer status:** Transferred

### D-08 — Type/tag model
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Type behaves as a categorized tag; filtering uses a unified model while keeping UI readable (badge + tags).
- **Impacts:** Piece Management, Work List
- **Transfer status:** Transferred

### D-09 — Chord/meter renderer contract
- **Date:** 2026-04-19
- **Status:** Transferred
- **Summary:** Use simple HTML structure (`span`-based) and let CSS define layout; chord appears left, meter right, sharing visual space when both are visible.
- **Impacts:** Renderer contract, Layer visibility rendering
- **Transfer status:** Transferred

---

### D-10 — Structured content model
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** `Piece.content` must no longer be modeled as a raw Markdown string. The domain model will use a discriminated structured content model: `TextPieceContent`, `PoemPieceContent`, and `SongPieceContent`.
- **Motivation:** Avoid Markdown lock-in, prepare song structure without future core refactor, and keep the domain independent from editor/import/export formats.
- **Impacts:** Domain Model, Piece Management, Annotation System, Snapshot & Layer State, Architecture
- **Transfer status:** Pending

### D-11 — Dual annotation target system
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Annotations must target structured domain locations instead of embedded Markdown anchor tags. Supported target families are text ranges, nodes, song cells, and future song-cell ranges.
- **Motivation:** Align with modern editor models, support robust text annotations, and allow future structural annotations for songs/workspaces.
- **Impacts:** Domain Model, Annotation System, Renderer, Editor Adapter
- **Transfer status:** Pending

### D-12 — Anchor tags are not source of truth
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Embedded anchor tags are no longer the canonical model for annotations. They may exist only as an implementation/export/rendering mechanism if needed.
- **Motivation:** Prevent Markdown pollution, avoid fragile text markers, and support non-linear structures like song cells.
- **Impacts:** Domain Model, Annotation System, Import/Export, Renderer
- **Transfer status:** Pending

### D-13 — Structured song model
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Songs must be prepared as structured content with sections and cells. `SongCell` is the atomic musical/textual unit and may own `chord` and `meter` values directly.
- **MVP scope:** Song UI is not part of the first functional MVP. Pitch dots, pitch lines, duration editing, advanced notation, and multi-cell annotation behavior are future features.
- **Impacts:** Domain Model, Renderer, Future Song UI, Annotation System
- **Transfer status:** Pending

### D-14 — Markdown is import/export format
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Markdown is supported as an import/export format, not as the internal source of truth. Internal text/poem content uses structured blocks and inline text runs.
- **Motivation:** Preserve flexibility for editor replacement, structured annotations, future workspace/narrative flows, and richer rendering.
- **Impacts:** Domain Model, Import/Export, Piece Management, Editor Adapter
- **Transfer status:** Pending

### D-15 — Tiptap OSS editor adapter
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Use Tiptap OSS as the initial editor engine, encapsulated behind an editor adapter/port. The domain must not store Tiptap JSON.
- **Rules:** Tiptap lives in infrastructure/UI only. Tiptap Pro/Platform features are not part of the core MVP.
- **Motivation:** Accelerate MVP using a mature ProseMirror-based editor while keeping the editor replaceable.
- **Impacts:** Architecture, Editor Modes, Domain Model, Annotation System
- **Transfer status:** Pending

### D-16 — React frontend strategy
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Switch the frontend strategy from Angular to React before implementation starts.
- **Motivation:** Better alignment with Tiptap ecosystem, broader market adoption, easier future hiring/collaboration, better fit for product/portfolio, and a flexible mobile path through Capacitor first and React Native later if needed.
- **Rules:** React is UI infrastructure only. Domain, application, ports, and adapters remain framework-independent.
- **Impacts:** Architecture, Backlog, Project Setup, UI Features
- **Transfer status:** Pending

### D-17 — Structured tag model
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Tags should be structured as `TagRef` with a category/kind, such as `type` or `user`, instead of mixing type semantics inside plain strings.
- **Motivation:** Keep filtering flexible and avoid ambiguous type-as-string behavior.
- **Impacts:** Domain Model, Piece Management, Work List
- **Transfer status:** Pending

### D-18 — UI strategy: Tailwind CSS + shadcn/ui
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Use Tailwind CSS and shadcn/ui for React UI implementation.
- **Rules:** UI components are copied into the project and remain owned/customizable by the app. UI layer must not contain domain logic.
- **Motivation:** Accelerate development with modern, customizable UI primitives without runtime component-library lock-in.
- **Impacts:** Architecture, Project Setup, UI Features
- **Transfer status:** Pending

### D-19 — Zustand for UI state only
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Use Zustand only for UI state such as modal state, panels, transient selections, and local view state.
- **Rules:** Zustand must not contain domain logic, persistence rules, business invariants, or application use cases.
- **Motivation:** Keep React UI state simple without introducing Redux-level ceremony.
- **Impacts:** Architecture, UI Features
- **Transfer status:** Pending

### D-20 — Zod for boundary validation
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Use Zod only at system boundaries to validate raw external data before mapping it into domain objects.
- **Flow:** External data → Zod validation → Mapper → Domain.
- **Rules:** Zod must not live in the domain and must not replace business/domain invariants.
- **Motivation:** Protect the domain from corrupted IndexedDB data, future API responses, imports, migrations, and backups.
- **Impacts:** Architecture, Persistence Adapters, Import/Export, Migrations
- **Transfer status:** Pending

### D-21 — Dexie for IndexedDB adapter
- **Date:** 2026-04-26
- **Status:** Decided
- **Summary:** Use Dexie as the initial IndexedDB adapter implementation.
- **Rules:** Dexie is infrastructure only. Repositories expose ports to the application layer. Domain must not depend on Dexie or IndexedDB.
- **Motivation:** Reduce IndexedDB complexity while preserving persistence replaceability.
- **Impacts:** Architecture, Persistence, Backlog
- **Transfer status:** Pending

---

## Documentation Transfer Checklist

These are the follow-up updates to fully transfer decisions into specs/docs.

| Item | Target docs | Depends on | Status |
|---|---|---|---|
| Reinforce adapters-for-persistence and adapters-for-rendering language | `openspec/architecture.md`, `openspec/specs/snapshot-and-layer-state/spec.md` | D-01 | Transferred |
| Keep autosave contract explicit (debounce + boundaries) | `openspec/specs/piece-management/spec.md` | D-01 | Transferred |
| Clarify integrity heuristic wording for MVP | `openspec/specs/annotation-system/spec.md` | D-01, D-02 | Transferred |
| Keep snapshot stale detection explicit (revision counter) | `openspec/specs/snapshot-and-layer-state/spec.md`, `openspec/domain-model.md` | D-01 | Transferred |
| Specify backup lifecycle (create/limit/prune) | `openspec/specs/snapshot-and-layer-state/spec.md` | D-02 | Transferred |
| Keep immediate visual feedback path for visualization-mode annotation add | `openspec/specs/annotation-system/spec.md`, `openspec/specs/editor-modes/spec.md` | D-03 | Transferred |
| Keep no-snapshot temporary state and annotation lock explicit | `openspec/specs/snapshot-and-layer-state/spec.md`, `openspec/specs/editor-modes/spec.md` | D-04 | Transferred |
| Finalize import constraints for unsupported Markdown structures | `openspec/specs/piece-management/spec.md` | D-05 | Transferred |
| Add short error policy table by error type | `openspec/non-functional.md`, `openspec/architecture.md` | D-06 | Transferred |
| Clarify needsReview delay expectations | `openspec/non-functional.md`, `openspec/specs/annotation-system/spec.md` | D-07 | Transferred |
| Confirm unified type/tag behavior in both management and list specs | `openspec/specs/piece-management/spec.md`, `openspec/specs/work-list/spec.md` | D-08 | Transferred |
| Add minimal renderer structure example for chord+meter pairing | `openspec/specs/snapshot-and-layer-state/spec.md` | D-09 | Transferred |
