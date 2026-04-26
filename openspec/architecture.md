# Architecture — NoteDraftForge

## Stack (MVP)
- **UI framework:** React (latest stable)
- **Editor adapter:** Tiptap OSS (infrastructure adapter)
- **Persistence adapter:** Dexie over IndexedDB
- **Boundary validation:** Zod
- **Styling:** Tailwind CSS
- **UI primitives:** shadcn/ui
- **Hosting:** GitHub Pages
- **Backend:** none in MVP
- **Mobile path:** React web first; Capacitor path first, React Native only if later justified

---

## Approach: Lightweight DDD + Hexagonal

The goal is to apply DDD and Hexagonal Architecture pragmatically:
small boundaries, explicit ports, replaceable adapters.

### Hexagonal commitments
- **Domain** contains entities, value objects, invariants, and domain rules only.
- **Application** orchestrates use cases using domain types + ports only.
- **Ports** are TypeScript interfaces describing required external capabilities.
- **Infrastructure adapters** implement ports (Dexie persistence, Tiptap editor integration, future API/drive adapters, UI wiring).
- **UI** is infrastructure: React components must not contain domain logic.
- External systems are always behind ports/adapters.

### Hard isolation rules
- Domain must not import React, Tiptap, Dexie, Zod, or any framework package.
- Domain must not store Tiptap JSON.
- Domain content is structured domain data, not Markdown source text.
- Markdown is import/export only.

---

## Explicit Layers

1. **Domain**
2. **Application**
3. **Ports**
4. **Infrastructure**
   - **Persistence (Dexie)**
   - **Editor (Tiptap)**
   - **Validation boundary (Zod + mappers)**
   - **UI (React + Tailwind + shadcn/ui + Zustand for UI state)**

---

## Folder Structure (target)

```
src/
  core/
    domain/
    application/
    ports/
    infrastructure/
      persistence/     ← Dexie adapters implementing repository ports
      editor/          ← Tiptap adapter(s), mapping editor model to app input/output
      validation/      ← Zod schemas for external/boundary payloads
      mappers/         ← external DTO/raw data <-> domain mapping
  ui/
    app/               ← React app shell
    features/          ← React feature modules/components (no domain rules)
    components/        ← shadcn/ui based primitives/composites
    state/             ← Zustand stores (UI state only)
    styles/            ← Tailwind config/theme utilities
```

### Import rules
- `core/domain/` must NOT import from any other layer.
- `core/application/` may import only `core/domain/` and `core/ports/`.
- `core/ports/` depends only on domain contracts/types when necessary.
- `core/infrastructure/` may import `core/ports/` and `core/domain/`.
- `ui/` may import application entrypoints and domain types, but must not implement business invariants.

---

## Ports and Adapter Responsibilities

### Persistence
- Repositories are defined as ports.
- Dexie adapters implement those ports.
- Persistence remains replaceable (future backend/API adapters can replace Dexie without changing domain/application).

### Editor
- Tiptap is an editor engine behind an adapter boundary.
- Tiptap node/JSON schemas must be translated by adapters/mappers before application/domain use.
- Domain model must never depend on ProseMirror/Tiptap data structures.

### Validation and mapping boundary
- Zod is boundary validation only (storage read, import, backup restore, future API payloads).
- Zod is not an infrastructure adapter implementing ports.
- Mappers convert validated external DTO/raw data into domain objects.
- Mandatory flow:
  - **External data → Zod validation → Mapper → Domain**
- Domain must not depend on Zod.
- Domain invariants remain domain-level rules and are not replaced by Zod schemas.

### UI
- Tailwind handles styling.
- shadcn/ui provides base components owned/customized inside the repo.
- UI layer must stay free of domain logic.

### State management
- Zustand is allowed for UI state only (modals, side panels, local selections, transient view state).
- Zustand must not contain business logic, persistence rules, domain invariants, or use case orchestration.

---

## Data Flows

### Local flow (MVP)

```
IndexedDB (Dexie) → Zod → Mapper → Domain → UI
```

### Future API flow (post-MVP direction)

```
API → React Query → Zod → Mapper → Domain → UI
```

In both flows, validation and mapping occur before domain construction/use.

---

## Use Case Pattern

One class/function per use case in `core/application`.
Use cases depend on ports, not adapter implementations.

```ts
export class CreatePieceUseCase {
  constructor(private readonly pieces: PieceRepository) {}

  async execute(input: CreatePieceInput): Promise<Piece> {
    const piece = createPiece(input);
    await this.pieces.save(piece);
    return piece;
  }
}
```

**Rules:**
- Use cases must not import React, Dexie, Tiptap, or Zod.
- Use cases must not contain UI rendering concerns.
- Use cases coordinate domain rules and ports only.

---

## Rendering and Snapshot Boundary

- Snapshot generation is infrastructure.
- Renderer consumes structured domain content + annotations and outputs static HTML.
- Layer visibility is CSS-driven and persisted per piece.
- No assumption that Markdown is internal source of truth.
- No `AnchorMark` architecture dependency.

---

## Snapshot Lifecycle (MVP defaults)

Two independent timers in edit mode:
- **Content autosave debounce (`800ms`)**
- **Snapshot inactivity debounce (`5s`)**

High-level flow:

```
User edits content
  → autosave debounce
  → revision/update timestamps
  → persist through repository ports (Dexie adapter behind ports)
  → snapshot invalidation
  → snapshot generation in background
  → snapshot save through SnapshotRepository port

User updates annotation
  → persist via ports
  → optional immediate overlay feedback in current view
  → snapshot invalidation
  → background regeneration

User toggles layer visibility
  → update layerVisibility state
  → apply/remove CSS class
  → persist visibility state
  → no full HTML rerender
```

---

## Testing Strategy

### Required
- **Domain tests:** invariants and pure domain behavior.
- **Application tests:** use case orchestration with mocked ports.
- **Architecture boundary tests:** enforce import rules between layers.

### Optional in MVP
- Infrastructure integration tests (Dexie/Tiptap adapter behavior) when risk justifies.

### Avoid
- Coupling tests to UI implementation details where behavior can be asserted at application/domain level.

---

## What to Avoid in MVP

- Framework leakage into domain/application.
- Storing editor-native JSON as domain state.
- Business logic inside React components or Zustand stores.
- Treating Markdown as canonical internal storage.
- Tight coupling to Dexie, Tiptap, or Zod in domain.

---

## Technical Roadmap (not MVP — direction only)

- **Google Drive Sync:** future persistence/sync adapter option when cross-device support is needed.
- **AI Integration (BYOK):** future adapter using structured content + domain metadata as context (still outside MVP scope).
- **Mobile path:** React web first, Capacitor if useful, React Native only if justified later.
- **Snapshot timing settings:** future user preference for generation timing (e.g., on-exit only / 5s / 2s).
- **Backend:** not planned in MVP, but possible later by replacing/adding adapters behind ports.

---

## Future-Aware Constraints

- Keep adapters replaceable (Dexie now, backend/API later).
- Keep editor replaceable (Tiptap now, alternative adapter later).
- Keep validation replaceable/evolvable at boundaries.
- Preserve hexagonal boundaries as the project grows.
