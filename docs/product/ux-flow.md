# MVP UX Flow

## Purpose
Define the minimal user path for MVP wireframes.

## Primary Flow

1. **Open app → Work List**
   - User sees pieces ordered by recent activity
   - User can filter by type/user tags

2. **Choose next action from Work List**
   - Open piece
   - Create new piece

3. **Open Piece → Visualization mode (default)**
   - If snapshot exists: show snapshot + layer controls
   - If no snapshot: show read-only base content, disable annotation actions, trigger snapshot generation

4. **Visualization interactions**
   - Toggle layers
   - Add annotation from selection (snapshot required)
   - Resolve `needsReview` (confirm / retarget / delete)
   - Start/stop auto-scroll only if retained by final MVP decision
   - Switch to editing mode

5. **Editing interactions**
   - Edit structured text/poem content
   - Edit metadata (title/language/user tags)
   - Return to visualization mode

6. **Exit / Return to Work List**
   - Pending changes are persisted by defined persistence flow

## Empty-State Flow
- **No pieces:** show create action
- **No filter matches:** show no-results state, keep filters active

## Guardrails for Wireframes
- Two modes only: visualization and editing
- Song UX is out of MVP (song may be hidden/disabled if surfaced)
- Import/export UX is out of MVP
- No additional screens beyond listed flow
- No future/non-MVP paths in primary navigation
- No UI assumptions about implementation internals (framework/editor payloads)
