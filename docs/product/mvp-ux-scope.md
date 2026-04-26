# MVP UX Scope

## Purpose
Define the minimum UX scope for wireframes, strictly limited to current MVP behavior.

## In Scope (MVP)

### Core Screens
1. **Work List**
   - List pieces sorted by `updatedAt` desc
   - Type badge + user tags
   - Structured tag filters
   - Empty states (no pieces / no filter results)

2. **Piece View — Visualization mode (default)**
   - Read-only snapshot view
   - Layer visibility toggles
   - Add/resolve annotation interactions (only when snapshot exists)
   - Start/stop auto-scroll only if retained by final MVP decision

3. **Piece View — Editing mode**
   - Structured text/poem content editing via Tiptap adapter
   - Metadata editing (title/language/user tags)
   - Return to visualization mode
   - No annotation create/update/delete in MVP editing mode

### Piece Types in MVP UX
- MVP UX focuses on `text` and `poem` pieces.
- Song exists in the domain model only.
- Song creation/editing/viewing UX is not in MVP.
- If `song` appears in UI, it must be hidden or explicitly disabled/not implemented.

## Global UX Rules
- Two modes only: `visualization` and `editing`
- Visualization is default when opening a piece
- Annotation actions require an available snapshot
- Editing mode does not expose layer visibility controls
- Editing mode does not include annotation actions

## Explicitly Out of Scope (NOT MVP)
- Song UX (creation/edit/view) and advanced song tooling
- Chord/meter editing, song grid, pitch/notation, rehearsal/focus flows
- Import/export UX flows
- Annotations while editing
- AI features
- Collaboration/multi-user flows
- Version history/timeline
- Advanced formatting toolbar
- Advanced search
- Workspace/grouping UX
