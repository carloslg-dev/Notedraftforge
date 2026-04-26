# Domain Model — NoteDraftForge

> This is the canonical source of truth for all domain types.
> All specs, use cases, and implementations must derive from this document.
> If there is a conflict between this file and any other spec, this file wins.

---

## Piece

Represents a single atomic creative unit.

```ts
interface Piece {
  id: string;             // UUID, generated on creation
  title: string;          // non-empty string
  type: PieceType;
  content: PieceContent;  // structured canonical content (not raw Markdown)
  language: string;       // ISO 639-1 code (e.g. 'en', 'es', 'ca')
  tags: TagRef[];         // structured tags; type semantics are explicit via tag kind
  createdAt: string;      // ISO 8601 datetime
  updatedAt: string;      // ISO 8601 datetime
  revision: number;       // monotonically increasing internal counter for snapshot freshness
}

type PieceType = 'text' | 'poem' | 'song';
```

### Rules
- `id` is immutable after creation
- `title` must be non-empty
- `content` is always structured domain data; editor formats and import/export formats are adapter concerns
- `language` must be a valid ISO 639-1 two-letter code
- `tags` uses explicit `TagRef.kind` semantics (no type-overloaded plain strings)
- Translations of a piece are separate `Piece` entities (no link in MVP)
- A `Piece` has no reference to any workspace or collection in the MVP
- `updatedAt` reflects the last user-visible change to content, metadata, or annotations
- `revision` starts at `0` and increments on any content or annotation change that invalidates the snapshot

---

## Structured piece content

`Piece.content` is a discriminated union by piece type.

```ts
type PieceContent = TextPieceContent | PoemPieceContent | SongPieceContent;

interface TextPieceContent {
  kind: 'text';
  blocks: TextBlock[];
}

interface PoemPieceContent {
  kind: 'poem';
  blocks: TextBlock[];
}

interface SongPieceContent {
  kind: 'song';
  sections: SongSection[];
}

interface TextBlock {
  id: string;
  kind: 'paragraph' | 'line' | 'heading' | 'quote';
  runs: TextRun[];
}

interface TextRun {
  id: string;
  text: string;
  marks?: TextMark[];
}

type TextMark = 'bold' | 'italic';

interface SongSection {
  id: string;
  kind: 'intro' | 'verse' | 'pre-chorus' | 'chorus' | 'bridge' | 'outro' | 'custom';
  label?: string;       // required when kind = 'custom'
  cells: SongCell[];
}

interface SongCell {
  id: string;
  text: string;
  chord?: ChordContent; // owned by the SongCell, not by Annotation
  meter?: MeterContent; // owned by the SongCell, not by Annotation
}

interface ChordContent {
  root: MusicalRoot;
  modifiers: MusicalModifier[];   // ordered, may be empty
  display: string;                // derived and stored, e.g. "C#m7"
}

type MusicalRoot = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// Modifier order is always: [alteration?, mode?, extension?]
// alteration: sharp | flat (mutually exclusive)
// mode: minor | major (mutually exclusive)
// extension: seventh
type MusicalModifier = 'sharp' | 'flat' | 'minor' | 'major' | 'seventh';

// meter — free text, e.g. "4/4", "3/4", "2/4"
type MeterContent = string;
```

### Content rules
- `TextPieceContent` and `PoemPieceContent` share block/run primitives and remain structurally distinct by discriminator
- `TextRun` may carry optional inline marks (`bold`, `italic`) through `marks`
- Song structure is represented through `SongSection` and `SongCell`
- `SongCell` is the atomic musical/textual unit in songs
- `chord` and `meter` live on `SongCell` when present
- Markdown may be used for import/export, but never as internal source of truth

---

## TagRef

Structured tag reference used by `Piece.tags`.

```ts
interface TagRef {
  kind: TagKind;
  value: string;
}

type TagKind = 'type' | 'user';
```

### Rules
- `value` must be non-empty
- `kind: 'type'` is reserved for type categorization semantics
- `kind: 'user'` is for free user-defined tags

---

## AnnotationTarget

Represents canonical structured targets for annotations.

```ts
type AnnotationTarget =
  | TextRangeTarget
  | TextNodeTarget
  | SongCellTarget
  | SongCellRangeTarget;

interface TextRangeTarget {
  kind: 'text-range';
  blockId: string;
  startOffset: number;   // inclusive
  endOffset: number;     // exclusive
}

interface TextNodeTarget {
  kind: 'text-node';
  blockId: string;
  runId?: string;
}

interface SongCellTarget {
  kind: 'song-cell';
  sectionId: string;
  cellId: string;
}

interface SongCellRangeTarget {
  kind: 'song-cell-range';
  sectionId: string;
  startCellId: string;
  endCellId: string;
}
```

### Rules
- `AnnotationTarget` is the only canonical annotation-target model in the domain
- Embedded anchor tags are not part of the source-of-truth domain model
- Target references must resolve within the same `Piece`
- For `TextRangeTarget`, `startOffset < endOffset` is required
- `TextRangeTarget.startOffset` and `endOffset` are measured against the plain text obtained by concatenating all `TextRun.text` values in the referenced `TextBlock`
- Inline marks (`TextRun.marks`) do not affect offset calculation
- `TextRun` splits exist only for inline formatting and must not define annotation boundaries

---

## Layer

Represents an independent visual channel. Each layer has its own visibility toggle
and groups exactly one annotation kind or visual channel.

```ts
interface Layer {
  id: LayerKind;
  source: LayerSourceKind;
}

type LayerKind =
  | 'chord'
  | 'meter'
  | 'breath'
  | 'intention'
  | 'comments';

type AnnotationKind = 'breath' | 'intent' | 'comment';
type SongCellPropertyKind = 'chord' | 'meter';
type LayerSourceKind = AnnotationKind | SongCellPropertyKind;
```

### Fixed layers (MVP)

| id (LayerKind) | source (LayerSourceKind) | UI name | Default visible |
|---|---|---|---|
| `chord` | `chord` | Chord | true |
| `meter` | `meter` | Meter | false |
| `breath` | `breath` | Breath | false |
| `intention` | `intent` | Intention | false |
| `comments` | `comment` | Comments | false |

Note: `chord` and `meter` layers are visual channels driven by `SongCell` data in song content.

### Rules
- Layers are fixed in the MVP. Users cannot create, rename, or delete layers.
- Layer visibility is **per-piece**, persisted in `PieceSnapshot.layerVisibility`.
- Toggling a layer updates `PieceSnapshot.layerVisibility` and applies a CSS class — it does NOT regenerate the snapshot HTML.

---

## Annotation

Represents interpretation metadata attached to a structured `AnnotationTarget` in a `Piece`.

```ts
interface Annotation {
  id: string;
  pieceId: string;
  target: AnnotationTarget;
  kind: AnnotationKind;
  content: AnnotationContent;
  layerId: LayerKind;
  status: AnnotationStatus;
}

type AnnotationStatus = 'valid' | 'needsReview';

// breath — always chosen explicitly by the user, never derived
type BreathContent = 'S' | 'L';

// intent — personal, AI must never write here
type IntentContent = string;

// comment — technical/compositional, AI may write here in the future
type CommentContent = string;

type AnnotationContent =
  | BreathContent
  | IntentContent
  | CommentContent;
```

### Content rules by kind

| kind | content type | constraint | AI can write |
|---|---|---|---|
| `breath` | `BreathContent` | must be `S` or `L`, always user-chosen | No |
| `intent` | `IntentContent` | non-empty string, personal | Never |
| `comment` | `CommentContent` | non-empty string | Future yes |

### Default layer per kind

| kind | default layerId (LayerKind) |
|---|---|
| `breath` | `breath` |
| `intent` | `intention` |
| `comment` | `comments` |

### Layer assignment rule
An annotation must belong to a layer whose `source` equals the annotation `kind`.
No cross-kind assignments are allowed.

### General rules
- `target` must reference an existing structured location in the same piece
- `status` defaults to `valid` on creation
- Multiple annotations of different kinds can reference the same target

---

## PieceSnapshot

Pre-rendered static HTML of a piece with all annotations embedded.
Used in visualization mode for instant, zero-render-cost display.

```ts
interface PieceSnapshot {
  pieceId: string;
  html: string;                                // static HTML, all annotations included
  layerVisibility: Record<LayerKind, boolean>; // per-piece layer state
  sourceRevision: number;                      // exact Piece.revision used to generate this snapshot
  generatedAt: string;                         // ISO 8601
}
```

### Generation rules
- Generated eagerly: 5 seconds after the last edit in editing mode, or immediately on exit from editing mode if there are pending changes
- Contains ALL annotations regardless of layer visibility — visibility is handled by CSS
- Layer visibility changes do NOT regenerate the snapshot HTML — they only update `layerVisibility` and apply CSS classes

### Invalidation rules
Snapshot must be regenerated when:
- `Piece.content` changes
- Any `Annotation` of that piece is created, updated, or deleted

Snapshot is NOT invalidated by:
- Layer visibility toggle

Revision consistency rule:
- A snapshot is current when `PieceSnapshot.sourceRevision === Piece.revision`
- A snapshot is stale when `PieceSnapshot.sourceRevision < Piece.revision`

### CSS visibility mechanism
Each annotation element in the HTML carries a CSS class for its layer kind:
```html
<span class="ndf-annotation ndf-layer-breath">S</span>
<span class="ndf-annotation ndf-layer-intention">crescendo emocional</span>
<span class="ndf-annotation ndf-layer-comments ndf-needs-review">revisar dicción</span>
```
The piece container carries hide classes based on `layerVisibility`:
```css
/* needsReview annotations always visible regardless of layer toggle */
.ndf-piece.ndf-hide-chord     .ndf-song-cell-chord                                { display: none; }
.ndf-piece.ndf-hide-meter     .ndf-song-cell-meter                                { display: none; }
.ndf-piece.ndf-hide-breath    .ndf-annotation.ndf-layer-breath:not(.ndf-needs-review)    { display: none; }
.ndf-piece.ndf-hide-intention .ndf-annotation.ndf-layer-intention:not(.ndf-needs-review) { display: none; }
.ndf-piece.ndf-hide-comments  .ndf-annotation.ndf-layer-comments:not(.ndf-needs-review)  { display: none; }
.ndf-annotation.ndf-needs-review { display: inline; }
```
Toggling a layer = adding/removing a CSS class on the container. Zero re-render.

### Future configuration (not MVP)
User-configurable snapshot generation timing:
- On exit only (for slow devices)
- After 5 seconds of inactivity (default)
- After 2 seconds of inactivity (for fast devices)

---

## Invariants

1. A `Piece` has structured `PieceContent` by discriminator (`text`, `poem`, `song`).
2. A `Piece` has zero or more `Annotation` entities.
3. A `Piece` with zero annotations is valid.
4. An `Annotation` belongs to exactly one `Piece`, one `AnnotationTarget`, and one `Layer`.
5. An `Annotation`'s `kind` must match its `Layer`'s compatible kind.
6. Multiple annotations of different kinds may share the same `AnnotationTarget`.
7. `Layer` definitions are fixed and visibility is per-piece, stored in `PieceSnapshot`.
8. Markdown is an import/export concern only, never the domain source of truth.
9. `chord` and `meter` values belong to `SongCell` in song content.
10. There are exactly 5 layers in the MVP. They are fixed and always exist.
11. `PieceSnapshot.sourceRevision` must match `Piece.revision` at generation time.
