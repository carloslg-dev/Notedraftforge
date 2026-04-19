# CLAUDE.md — NoteDraftForge

## Start here

Before any task, read `openspec/project.md`.
It provides orientation, the specs index, and the workflow summary.

---

## Project in one line

Private-first Markdown editor for poems, songs, and structured text.
Annotations (chord, meter, breath, intention, comment) are attached to anchor zones in the text.
Visualization uses pre-rendered snapshots with CSS-toggled layers.

---

## Key constraints

- **SDD: no code without a spec.** Every implementation must reference a `openspec/specs/<feature>/spec.md`.
- **DDD + Hexagonal Architecture.** `core/domain/` must have zero dependencies on Angular, IndexedDB, or any framework.
- **No backend, no sync, no AI features in MVP.**
- **Angular + IndexedDB + GitHub Pages.** No other stack choices in MVP.

---

## Where to find things

| Need | File |
|---|---|
| Domain types (canonical) | `openspec/domain-model.md` |
| Architecture rules + folder structure | `openspec/architecture.md` |
| Feature specs | `openspec/specs/<feature>/spec.md` |
| Naming rules | `openspec/terminology.md` |
| Non-functional requirements | `openspec/non-functional.md` |
| Cross-spec decisions | `openspec/decisions/decisions.md` |
| Epics and issue backlog | `openspec/backlog.md` |
| Workflow rules | `openspec/workflow/workflow-rules.md` |
| Agent behavior rules | `openspec/workflow/agent-rules.md` |
| Issue template | `openspec/templates/issue-template.md` |
| Execution checklist | `openspec/templates/checklist-execution.md` |
| Review checklist | `openspec/templates/checklist-review.md` |
| AI prompt template | `openspec/templates/ai-prompt.md` |

---

## Commit convention

Conventional Commits in English: `type(scope): message`

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

Examples:
- `feat(annotation): add needsReview resolution flow`
- `fix(snapshot): prevent duplicate regeneration on toggle`
