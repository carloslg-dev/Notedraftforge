# Spec: Work List

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Display all Pieces as a list of Works, allow filtering by tags, and navigate to a selected Work.

---

## Screen: Works List

### Entry
- Default screen on app launch
- Destination after closing/leaving a piece

### Behavior
- Load all pieces via `PieceRepository.getAll()` on entry
- Display each piece as a list item showing: `title`, `type` badge, and any user-defined tags
- If the list is empty, show an empty state (see below)

---

## Use Cases

### UC-WL-01: Display Works List
**Trigger:** Screen is entered  
**Behavior:**
- Fetch all pieces
- Sort by `updatedAt` descending (most recently updated first)
- Render list

---

### UC-WL-02: Filter by Tag
**Trigger:** User selects one or more tags from the filter bar  
**Behavior:**
- Filter is applied client-side on the already-loaded list
- A piece is shown if it contains **all** selected tags
- Selecting the same tag again deselects it
- When no tags are selected, all pieces are shown

**Tag list in filter bar:**
- Show only tags that exist on at least one piece
- Always include the type tags (`text`, `poem`, `song`) if any piece has that type
- Sort tags alphabetically, with type tags shown first
- Type tags and user-defined tags are filtered through one unified matching model; the type badge is only a UI distinction, not a separate filtering system

---

### UC-WL-03: Navigate to Work
**Trigger:** User taps the title area of a list item  
**Behavior:**
- Navigate to visualization mode for the selected piece

---

### UC-WL-04: Delete Piece from List
**Trigger:** User taps the delete action on a list item  
**Behavior:**
- Show a confirmation dialog: "Are you sure you want to delete this work? This action cannot be undone."
- If confirmed: execute UC-PM-06 (delete piece + cascade annotations), return to list
- If cancelled: dismiss dialog, no changes

**Rule:** The delete action is always visible per list item — no swipe gesture required. Simple and explicit.

---

### UC-WL-05: Navigate to Edit from List
**Trigger:** User taps the edit action on a list item  
**Behavior:**
- Navigate directly to editing mode for the selected piece (skip visualization)

---

### UC-WL-06: Empty State
**Trigger:** No pieces exist (first launch or after deleting all pieces)  
**Behavior:**
- Show a message indicating the list is empty
- Show two action shortcuts: "Create new work" and "Import .md file"
- These shortcuts trigger UC-PM-01 and UC-PM-07 respectively

---

## List Item Display

Each list item shows:
- `title` (primary label)
- `type` as a styled badge (`text` | `poem` | `song`) representing the system-managed type tag
- User-defined tags as smaller chips (if any)
- `updatedAt` formatted as a relative date (e.g. "2 days ago")

---

## Non-Goals (MVP)
- No search by title or content
- No sorting options (always by updatedAt desc)
- No bulk selection for deletion
- No drag-to-reorder
- No grouping by type or language
- No multi-piece export from the list (future — export lives inside each open piece in MVP)
