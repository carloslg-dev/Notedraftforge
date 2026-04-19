# NoteDraftForge — Project Context

> This file is the first document an agent reads before any task.
> It provides orientation. For authoritative rules, follow links to the referenced specs.

---

## Purpose
Private-first, Markdown-based editor for writing and interpreting poems, songs, and structured text.
Targeted at songwriters and spoken-word / stage poets.

---

## MVP Goals
- A working editor usable for real creative writing
- Support structured annotations and layers, separated from the Markdown content
- Keep content and interpretation cleanly separated
- Local persistence only (no backend, no sync)

## Non-Goals (MVP)
- No AI features
- No backend or sync
- No collaboration
- No workspace or collection management
- No versioning

---

## Core Concepts

See `openspec/domain-model.md` for authoritative type definitions.

| Concept | Short definition |
|---|---|
| Piece | A single atomic creative unit (poem, song, text). Domain term. |
| Work | User-facing name for a Piece. UI term only. |
| Annotation | Information attached to an AnchorMark, a system-delimited text zone in a Piece |
| Layer | A logical grouping of annotations. Controls visibility and rendering. |

Naming rules: see `openspec/terminology.md`

---

## Architecture

See `openspec/architecture.md` for full rules.

- **Frontend:** Angular
- **Persistence:** IndexedDB
- **Hosting:** GitHub Pages
- **Pattern:** Lightweight DDD + Hexagonal Architecture

---

## Workflow

See `openspec/workflow/workflow-rules.md` for full rules.
See `openspec/workflow/agent-rules.md` for agent constraints.
Track cross-spec decisions in `openspec/decisions/decisions.md`.
Implementation order and issue breakdown: `openspec/backlog.md`.

- SDD: no implementation without a spec
- Every task starts with a GitHub issue referencing the relevant `openspec/specs/<feature>/spec.md`
- DoD: code + tests (if applicable) + docs updated + lint OK

---

## Specs Index

| Feature | Spec |
|---|---|
| Piece management (CRUD, import, export) | `openspec/specs/piece-management/spec.md` |
| Annotation system (annotations, layers, anchor updates) | `openspec/specs/annotation-system/spec.md` |
| Editor modes (visualization vs editing) | `openspec/specs/editor-modes/spec.md` |
| Work list (list, filter, navigation) | `openspec/specs/work-list/spec.md` |
| Layer visibility (toggle, rendering) | `openspec/specs/layer-visibility/spec.md` |
| Snapshot and layer state (pre-render, CSS toggle, persistence) | `openspec/specs/snapshot-and-layer-state/spec.md` |

## Non-Functional Requirements

`openspec/non-functional.md` — performance, offline, DOM limits, accessibility, supported environments.

---

## Future (not MVP)
- Workspace system: curated groupings of works (books, recitals, albums)
- AI integration: context-rich suggestions based on structured metadata
- Versioning: edit history per piece
- Backend + sync
