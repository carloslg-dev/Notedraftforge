# Terminology — NoteDraftForge

## Canonical Terms

### Piece
- **Context:** domain, code, data model, use cases, ports, adapters
- **Definition:** A single atomic creative unit (poem, song, or structured text)
- **Rule:** Use `Piece` in all TypeScript types, interfaces, class names, method names, and file names under `/core/domain` and `/core/application`

### Work
- **Context:** UI, UX, user-facing strings, Angular component labels, route names
- **Definition:** The user-facing name for a Piece
- **Rule:** Use `Work` in Angular component names, route paths, and all strings visible to the user. Never use `Piece` in UI copy.

### Annotation
- **Context:** domain and UI
- **Definition:** A piece of information attached to an AnchorMark, a system-delimited text zone within a Piece's Markdown content
- **Rule:** Use `Annotation` in both domain and UI contexts. No alias.

### Layer
- **Context:** domain and UI
- **Definition:** An independent visual channel grouping one annotation kind. Each layer has its own visibility toggle.
- **Rule:** Use `Layer` in both domain and UI contexts. No alias.

### Chord
- **Context:** domain and UI
- **Definition:** A musical chord annotation — a root note plus optional modifiers (e.g. C#m7). Replaces the earlier term `musical_note`.
- **Rule:** Use `chord` as the AnnotationKind value and in all related type names. Never use `musical_note` or `note` for this concept.

### Comment
- **Context:** domain and UI
- **Definition:** A free-text technical or compositional annotation, equivalent to a Word comment. In the future, AI suggestions will be delivered as comments.
- **Rule:** Use `comment` as the AnnotationKind value. Never use `note` or `notes` for this concept in domain code.

### Workspace
- **Context:** future — NOT MVP
- **Definition:** A higher-level curated grouping of works (e.g. a poetry book, a recital set, an album draft)
- **Rule:** Do not use this term in MVP code or specs. Reserved for future implementation.

---

## Prohibited Substitutions

| Do NOT use | Use instead | Context |
|---|---|---|
| Poem, Song, Text as type names | Piece with type field | domain code |
| musical_note, note for chord annotation | chord | everywhere |
| note, notes for comment annotation | comment | domain code |
| Group, Category for layer | Layer | everywhere |
| Document, File for piece | Piece (domain) / Work (UI) | everywhere |
| Work in domain types | Piece | domain code |
| Piece in UI copy | Work | user-facing strings |

---

## Type Values — canonical string literals

### Piece.type
text | poem | song

### Layer.id (LayerKind — fixed, stable)
chord | meter | breath | intention | comments

### Annotation.kind
chord | meter | breath | intent | comment

### Annotation.status
valid | needsReview

### MusicalModifier order
[alteration?, mode?, extension?]
- alteration: sharp | flat (mutually exclusive)
- mode: minor | major (mutually exclusive)
- extension: seventh

---

## Future annotation kinds (not MVP)
- dynamics — volume/intensity line (crescendo, decrescendo, steady) rendered inside chord/meter boxes, can span multiple measures
