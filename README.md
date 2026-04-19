# NoteDraftForge

Private-first, Markdown-based creative editor for poems, songs, and structured text.

## Current Status

This repository is currently documentation-first.
The source of truth is under `openspec/` (SDD workflow), and app implementation is pending.

## Project Goal

Build an offline-first editor focused on creative writing and interpretation layers:
- Write and edit Markdown content.
- Attach structured annotations (chord, meter, breath, intention, comment) to anchor-based text zones.
- Manage per-piece layer visibility with fast snapshot rendering.

## Documentation Map

Start here:
- `openspec/project.md` - project context, goals, scope
- `openspec/domain-model.md` - canonical domain types and invariants
- `openspec/architecture.md` - DDD + hexagonal architecture rules
- `openspec/non-functional.md` - performance, offline, accessibility requirements
- `openspec/terminology.md` - naming conventions

Feature specs:
- `openspec/specs/piece-management/spec.md`
- `openspec/specs/annotation-system/spec.md`
- `openspec/specs/editor-modes/spec.md`
- `openspec/specs/work-list/spec.md`
- `openspec/specs/layer-visibility/spec.md`
- `openspec/specs/snapshot-and-layer-state/spec.md`

Process rules for agents:
- `openspec/workflow/workflow-rules.md`
- `openspec/workflow/agent-rules.md`

Decision log:
- `openspec/decisions/decisions.md`

Epic and issue backlog:
- `openspec/backlog.md`

## Workflow (SDD)

1. Open or link a GitHub issue with goal, scope, constraints, acceptance criteria, and non-goals.
2. Update or add the corresponding `openspec/specs/<feature>/spec.md`.
3. Implement only after spec is clear and accepted.
4. Keep docs in sync with changes.
5. Validate DoD: code + tests (when applicable) + docs + lint.
