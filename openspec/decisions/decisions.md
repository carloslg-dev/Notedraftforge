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
