# Domain Model — NoteDraftForge

> This is the canonical source of truth for all domain types.
> All specs, use cases, and implementations must derive from this document.
> If there is a conflict between this file and any other spec, this file wins.

---

## Piece

Represents a single atomic creative unit.

```ts
interface Piece {
  id: string;           // UUID, generated on creation
  title: string;        // non-empty string
  type: PieceType;
  content: string;      // raw Markdown source with embedded AnchorMark tags
  language: string;     // ISO 639-1 code (e.g. 'en', 'es', 'ca')
  tags: string[];       // user-defined tags; type value is always included
  createdAt: string;    // ISO 8601 datetime
  updatedAt: string;    // ISO 8601 datetime
  revision: number;     // monotonically increasing internal counter for snapshot freshness
}

type PieceType = 'text' | 'poem' | 'song';
```

### Rules
- `id` is immutable after creation
- `title` must be non-empty
- `type` is always reflected as a tag in `tags`
- `content` is the Markdown source with embedded anchor marks (see AnchorMark)
- `language` must be a valid ISO 639-1 two-letter code
- Translations of a piece are separate `Piece` entities (no link in MVP)
- A `Piece` has no reference to any workspace or collection in the MVP
- `updatedAt` reflects the last user-visible change to content, metadata, or annotations
- `revision` starts at `0` and increments on any content, annotation, or anchor change that invalidates the snapshot

---

## AnchorMark

Represents a physical text zone delimited by tags embedded in `Piece.content`.
Multiple annotations can reference the same AnchorMark.

```ts
interface AnchorMark {
  id: string;       // format: "a" followed by a positive integer, e.g. "a1", "a2", "a42"
                    // unique per piece, assigned sequentially by the system
                    // never a UUID — must match regex /^a\d+$/ to ensure strip regex works
  pieceId: string;
}
```

### Embedded format in Piece.content

```
<!--a1s-->voy<!--a1e-->
<!--a2s--><!--a2e-->   ← empty anchor (e.g. instrumental measure, no lyrics)
```

- `<!--{id}s-->` = anchor start
- `<!--{id}e-->` = anchor end
- Anchors may overlap (e.g. an intention spanning several chord anchors)
- Empty anchors (start immediately followed by end) are valid and common

### Export rule
When exporting to `.md`, all anchor tags are stripped with a single regex:
```
/<!--a\d+[se]-->/g → ""
```
The exported Markdown is clean — no anchor syntax visible to the user.

### needsReview trigger
If an edit corrupts an anchor tag (e.g. deletes `<!--a1s-->` but not `<!--a1e-->`),
all annotations referencing that anchorId must be marked `status: 'needsReview'`.

### Cascade rule
- Deleting a `Piece` deletes all its `AnchorMark` and `Annotation` entities
- Deleting an `AnchorMark` marks all its referencing `Annotation` entities as `needsReview`

---

## Layer

Represents an independent visual channel. Each layer has its own visibility toggle
and groups exactly one annotation kind.

```ts
interface Layer {
  id: LayerKind;
  kind: AnnotationKind;
}

type LayerKind =
  | 'chord'
  | 'meter'
  | 'breath'
  | 'intention'
  | 'comments';
```

### Fixed layers (MVP)

| id (LayerKind) | kind (AnnotationKind) | UI name | Default visible |
|---|---|---|---|
| `chord` | `chord` | Chord | true |
| `meter` | `meter` | Meter | false |
| `breath` | `breath` | Breath | false |
| `intention` | `intent` | Intention | false |
| `comments` | `comment` | Comments | false |

Note: `Layer.id` and `Layer.kind` share the same value for all layers except
`intention` (id) → `intent` (kind) and `comments` (id) → `comment` (kind).
This is intentional: `id` is the layer identifier, `kind` is the annotation kind it groups.

### Rules
- Layers are fixed in the MVP. Users cannot create, rename, or delete layers.
- Each layer renders exactly one annotation kind.
- Layer visibility is **per-piece**, persisted in `PieceSnapshot.layerVisibility`.
- Toggling a layer updates `PieceSnapshot.layerVisibility` and applies a CSS class — it does NOT regenerate the snapshot HTML.
- Layers are fixed definitions (5 compile-time records). Visibility state lives only in `PieceSnapshot.layerVisibility`.

### Visual rendering per layer

**layer-chord + layer-meter:**
When both are visible and two annotations share the same anchorId, rendered in one
measure box — chord on the left, meter on the right. Independent in the data model;
visual grouping is a rendering concern only.

**layer-breath:**
Rendered as a small marker inside or adjacent to the anchor zone.
Displays `S` (short) or `L` (long) in a distinct color.

**layer-intention:**
Rendered as a label above the text. Vertical offset increases if chord/meter boxes
are visible in the same range. Can span multiple anchor zones.

**layer-comments:**
Rendered as a label above the text. Same vertical logic as intention.
Visually distinct from intention (technical/editorial style).
Future: AI-generated comments appear here with a distinct AI indicator.

### Future layer (not MVP)
- `layer-dynamics` — volume/intensity line (crescendo, decrescendo, steady),
  rendered inside measure boxes, can span multiple anchors.

---

## Annotation

Represents information attached to an AnchorMark zone in a Piece.

```ts
interface Annotation {
  id: string;
  pieceId: string;
  anchorId: string;          // references AnchorMark.id
  kind: AnnotationKind;
  content: AnnotationContent;
  layerId: LayerKind;
  status: AnnotationStatus;
}

type AnnotationKind = 'chord' | 'meter' | 'breath' | 'intent' | 'comment';
type AnnotationStatus = 'valid' | 'needsReview';

// chord
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

// breath — always chosen explicitly by the user, never derived
type BreathContent = 'S' | 'L';

// intent — personal, AI must never write here
type IntentContent = string;

// comment — technical/compositional, AI may write here in the future
type CommentContent = string;

type AnnotationContent =
  | ChordContent
  | MeterContent
  | BreathContent
  | IntentContent
  | CommentContent;
```

### Content rules by kind

| kind | content type | constraint | AI can write |
|---|---|---|---|
| `chord` | `ChordContent` | root required; modifiers ordered per rules | No |
| `meter` | `MeterContent` | non-empty string | No |
| `breath` | `BreathContent` | must be `S` or `L`, always user-chosen | No |
| `intent` | `IntentContent` | non-empty string, personal | Never |
| `comment` | `CommentContent` | non-empty string | Future yes |

### ChordContent rules
- `root` must be one of: `A`, `B`, `C`, `D`, `E`, `F`, `G`
- `modifiers` order: `[alteration?, mode?, extension?]`
  - alteration (max 1): `sharp` or `flat` — mutually exclusive
  - mode (max 1): `minor` or `major` — mutually exclusive
  - extension (max 1): `seventh`
- `display` derived from root + modifiers in English notation:
  - `sharp`→`#`, `flat`→`b`, `minor`→`m`, `major`→`M`, `seventh`→`7`
  - Example: `{root:'C', modifiers:['sharp','minor','seventh']}` → `display:"C#m7"`
- `display` is stored and recomputed when root or modifiers change

### Default layer per kind

| kind | default layerId (LayerKind) |
|---|---|
| `chord` | `chord` |
| `meter` | `meter` |
| `breath` | `breath` |
| `intent` | `intention` |
| `comment` | `comments` |

### Layer assignment rule
An annotation of kind `chord` can only belong to layer `chord`, and so on.
The kind determines the layer. No cross-kind assignments are allowed.

### General rules
- `anchorId` must reference an existing `AnchorMark` in the same piece
- `status` defaults to `valid` on creation
- Multiple annotations of different kinds can reference the same `anchorId`

---

## PieceSnapshot

Pre-rendered static HTML of a piece with all annotations embedded.
Used in visualization mode for instant, zero-render-cost display.

```ts
interface PieceSnapshot {
  pieceId: string;
  html: string;                           // static HTML, all annotations included
  layerVisibility: Record<LayerKind, boolean>; // per-piece layer state
  sourceRevision: number;                 // exact Piece.revision used to generate this snapshot
  generatedAt: string;                    // ISO 8601
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
- Any `AnchorMark` of that piece is created or deleted

Snapshot is NOT invalidated by:
- Layer visibility toggle

Revision consistency rule:
- A snapshot is current when `PieceSnapshot.sourceRevision === Piece.revision`
- A snapshot is stale when `PieceSnapshot.sourceRevision < Piece.revision`

### CSS visibility mechanism
Each annotation element in the HTML carries a CSS class for its layer kind:
```html
<span class="ndf-annotation ndf-layer-chord">Am</span>
<span class="ndf-annotation ndf-layer-meter">2/4</span>
<span class="ndf-annotation ndf-layer-chord ndf-needs-review">G</span>
```
The piece container carries hide classes based on `layerVisibility`:
```css
/* needsReview annotations always visible regardless of layer toggle */
.ndf-piece.ndf-hide-chord     .ndf-annotation.ndf-layer-chord:not(.ndf-needs-review)     { display: none; }
.ndf-piece.ndf-hide-meter     .ndf-annotation.ndf-layer-meter:not(.ndf-needs-review)     { display: none; }
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

1. A `Piece` has zero or more `AnchorMark` entities.
2. A `Piece` has zero or more `Annotation` entities.
3. A `Piece` with zero annotations is a valid, normal Markdown document.
4. An `Annotation` belongs to exactly one `Piece`, one `AnchorMark`, and one `Layer`.
5. An `Annotation`'s `kind` must match its `Layer`'s `kind`.
6. Multiple annotations of different kinds may share the same `AnchorMark`.
7. `Layer` definitions are fixed and visibility is per-piece, stored in `PieceSnapshot`.
8. `Piece.content` may contain anchor tags. Exported `.md` files never contain anchor tags.
9. The semantic content of `Piece.content` (excluding anchor tags) must never be modified by the annotation system.
10. There are exactly 5 layers in the MVP. They are fixed and always exist.
11. `PieceSnapshot.sourceRevision` must match `Piece.revision` at generation time.
