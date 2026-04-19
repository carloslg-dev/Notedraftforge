# Spec: Piece Management

> References: `openspec/domain-model.md`, `openspec/terminology.md`

## Purpose
Allow the user to create, read, update, delete, import, and export Pieces (shown as "Works" in the UI).

---

## Use Cases

### UC-PM-01: Create Piece
**Trigger:** User taps "create" in the Global FAB

**Creation modal:**
The modal asks for 3 fields before creating the piece:
- `title` — text input with placeholder "New piece" shown in muted grey. On focus the placeholder disappears and the user types their title. If the user saves without typing, "New piece" is used as the actual title value.
- `type` — selector: `text | poem | song`, default `text`
- `language` — selector: ISO 639-1 code, default `es` (future: user-configurable default in settings)

**Behavior on Save:**
- Generate a new UUID for `id`
- Set `content` to empty string
- Set `tags` to `[type]` (type tag always present, system-managed)
- Set `createdAt` and `updatedAt` to current datetime (ISO 8601)
- Set `revision` to `0`
- Persist via `PieceRepository.save()`
- Navigate to editing mode for the new piece

**Validation:**
- `title`: if empty on save, use "New piece" as default — never reject for empty title
- `type` must be one of `text | poem | song`
- `language` must be a valid ISO 639-1 two-letter code

---

### UC-PM-02: Read Piece List
**Trigger:** User opens the Works List screen  
**Behavior:**
- Load all pieces via `PieceRepository.getAll()`
- Display as a list, showing `title`, `type`, and `tags`
- If the list is empty, display an empty state with a prompt to create or import

---

### UC-PM-03: Filter Pieces by Tag
**Trigger:** User selects one or more tags in the filter UI  
**Behavior:**
- Filter the loaded list client-side (no new DB query)
- A piece matches if it has ALL selected tags
- Clearing all filters shows all pieces

---

### UC-PM-04: Update Piece Content
**Trigger:** User edits text in editing mode  
**Behavior:**
- Update `Piece.content` with the new Markdown string
- Update `updatedAt` to current datetime
- Increment `revision`
- Persist via `PieceRepository.save()` using autosave debounce (MVP default: `800ms`)
- Trigger anchor integrity check (UC-AS-06)

**Ordering rule:**
- The content save starts a single content-change cycle
- Any `needsReview` updates derived from UC-AS-06 must be persisted before snapshot regeneration for that same cycle

---

### UC-PM-05: Update Piece Metadata
**Trigger:** User edits title, type, language, or tags
**Behavior:**
- Apply the change to the relevant field
- If `type` changes: remove the old type tag from `tags`, add the new type tag
- Update `updatedAt`
- Persist via `PieceRepository.save()`

**Snapshot rule:**
- Metadata-only changes do NOT increment `revision` and do NOT invalidate the current snapshot

**Tag rules:**
- The type tag (e.g. `"poem"`, `"song"`, `"text"`) is system-managed and cannot be removed by the user. It does not appear as a removable chip in the tag editor UI.
- User-defined tags can be freely added and removed.
- Type tags and user-defined tags share one unified filter model. In list/filter UIs, the type tag is displayed first as a badge, but matching logic is the same as for any other tag.
- When the user types a new tag name, the system checks existing tags across all pieces (case-insensitive). If a match exists, the existing tag is linked — no duplicate is created.
- Tag comparison is case-insensitive: `"Rock"` and `"rock"` are the same tag. The first-used casing is preserved as the canonical form.

**Validation:**
- `title`: if empty on save, use "New piece" as default
- `type` must be one of `text | poem | song`
- `language` must be a valid ISO 639-1 two-letter code

---

### UC-PM-06: Delete Piece
**Trigger:** User confirms deletion of a piece
**Behavior:**
- Delete all annotations via `AnnotationRepository.deleteByPieceId(pieceId)`
- Delete all anchor marks via `AnchorRepository.deleteByPieceId(pieceId)`
- Delete the snapshot via `SnapshotRepository.deleteByPieceId(pieceId)`
- Delete the piece via `PieceRepository.delete(id)`
- Navigate back to the Works List

**Rule:** Deletion is permanent. No soft delete in MVP.

---

### UC-PM-07: Import Markdown Files
**Trigger:** User selects one or more `.md` files via the Global FAB import action  
**Behavior (per file):**
- Read the file content as a UTF-8 string
- Normalize imported Markdown to the MVP-supported text-oriented subset when needed
- Create a new `Piece` with:
  - `title`: filename without the `.md` extension
  - `content`: normalized Markdown content
  - `type`: `text` (default, user can change after import)
  - `language`: `es` (default, user can change after import)
  - `tags`: `['text']`
  - `createdAt` / `updatedAt`: current datetime
  - `revision`: `0`
- Persist via `PieceRepository.save()`

**Rules:**
- No deduplication. Importing the same file twice creates two pieces.
- If a file cannot be read, skip it and show a non-blocking error for that file.
- Import is intended for text-oriented Markdown only.
- Unsupported complex structures may be simplified into plain text-oriented Markdown for MVP consistency.
- Lists and bullets are not preserved as structured list semantics in MVP; they may be flattened into plain text lines during import normalization.

**Normalization rules (MVP):**
- Preserve paragraphs, headings, emphasis, inline links, and plain line breaks as text-oriented Markdown
- Convert bullet and ordered list items into plain text lines, preserving order but removing list structure
- Convert table rows into plain text lines by joining cells with ` | `
- Remove unsupported HTML/media wrappers while preserving human-readable fallback text or URLs when available

---

### UC-PM-08: Export Piece as Markdown
**Trigger:** User triggers export from within the open piece (visualization or editing mode)
**MVP scope:** export applies to the currently open piece only. Multi-piece export is disabled in MVP (UI entry point hidden or disabled — to be defined when specced).

**Behavior:**
- Take `Piece.content` (which may contain anchor tags)
- Strip all anchor tags using regex: `/<!--a\d+[se]-->/g → ""`
- Export the clean Markdown string
- Filename = `{piece.title}.md` (sanitize: replace `/`, `\`, `:` with `-`)
- Trigger one file download

**Rules:**
- Annotations are NOT included in the exported Markdown
- Metadata (title, type, language, tags) is NOT included in the exported Markdown
- Anchor tags are ALWAYS stripped — the exported file is clean Markdown
- Export is a read-only operation; it does not modify the piece or its stored content

---

## Non-Goals (MVP)
- No versioning or edit history
- No duplicate detection on import
- No metadata export (frontmatter, JSON sidecar, etc.)
- No workspace or collection references on Piece
- No sync or backend persistence
