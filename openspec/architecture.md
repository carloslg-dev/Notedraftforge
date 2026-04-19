# Architecture — NoteDraftForge

## Stack (MVP)
- **Framework:** Angular (latest stable)
- **Persistence:** IndexedDB (via adapter)
- **Hosting:** GitHub Pages
- **Backend:** none — not planned unless a clear reason emerges
- **Mobile:** Angular in browser (MVP); Capacitor → Android APK when the product justifies it

---

## Approach: Lightweight DDD + Hexagonal

The goal is to learn and apply DDD and Hexagonal Architecture in a pragmatic way.
Avoid ceremony. Avoid over-abstraction. Deliver working software.

### What this means in practice
- The **domain** contains entities, value objects, and domain rules. Zero dependencies on Angular, IndexedDB, or any framework.
- **Use cases** orchestrate domain logic. They depend on domain types and port interfaces only.
- **Ports** are TypeScript interfaces that define what the application needs from the outside world.
- **Adapters** implement port interfaces. They contain IndexedDB calls, file I/O, etc.
- **Features** are Angular modules/components. They call use cases. They contain no domain logic.
- Persistence, snapshot storage, and rendered output generation must stay behind ports/adapters; none of these concerns are allowed to leak into Angular components.

---

## Folder Structure

```
src/app/
  core/
    domain/
      piece/          ← Piece, PieceType, domain rules
      anchor/         ← AnchorMark, anchor tag parsing and generation
      annotation/     ← Annotation, all content types, kind rules
      layer/          ← Layer, LayerKind, mapping rules, CSS class rules
      snapshot/       ← PieceSnapshot, invalidation rules, CSS mechanism
    application/
      use-cases/      ← one file per use case
    ports/            ← TypeScript interfaces for all repositories
    infrastructure/
      persistence/    ← IndexedDB adapters
      renderer/       ← snapshot HTML generation (pure, no Angular deps)
  features/
    work-list/        ← WorkListComponent
    work-view/        ← WorkViewComponent (loads snapshot, applies CSS)
    work-editor/      ← WorkEditorComponent (Markdown editor, hides anchors)
  shared/
```

### Import rules
- `core/domain/` must NOT import from `core/infrastructure/`, `features/`, or Angular
- `core/application/` must NOT import from `core/infrastructure/` or `features/`
- `features/` may import from `core/application/` and `core/domain/` (types only)
- `core/infrastructure/` may import from `core/domain/` and `core/ports/`

---

## MVP Ports Required

```ts
// core/ports/piece-repository.port.ts
interface PieceRepository {
  getAll(): Promise<Piece[]>;
  getById(id: string): Promise<Piece | null>;
  save(piece: Piece): Promise<void>;
  delete(id: string): Promise<void>;
}

// core/ports/anchor-repository.port.ts
interface AnchorRepository {
  getByPieceId(pieceId: string): Promise<AnchorMark[]>;
  save(anchor: AnchorMark): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
}

// core/ports/annotation-repository.port.ts
interface AnnotationRepository {
  getByPieceId(pieceId: string): Promise<Annotation[]>;
  save(annotation: Annotation): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
  deleteByAnchorId(anchorId: string): Promise<void>;
}

// core/ports/snapshot-repository.port.ts
interface SnapshotRepository {
  getByPieceId(pieceId: string): Promise<PieceSnapshot | null>;
  save(snapshot: PieceSnapshot): Promise<void>;
  deleteByPieceId(pieceId: string): Promise<void>;
}
```

In MVP, the snapshot persistence adapter also owns bounded rendered recovery-copy
storage. A dedicated backup port is only introduced if recovery flows later need
their own explicit UI/use cases.
No `LayerRepository` port is required in MVP: the 5 layer definitions are fixed
compile-time constants and only their per-piece visibility state is persisted.

---

## Use Case Pattern

One class per use case. Constructor receives port interfaces via Angular DI.

```ts
// core/application/use-cases/create-piece.use-case.ts
export class CreatePieceUseCase {
  constructor(private readonly pieces: PieceRepository) {}
  execute(input: CreatePieceInput): Promise<Piece> { ... }
}
```

**Rules:**
- Use cases validate inputs against domain rules before calling ports
- Use cases must not contain UI logic or direct IndexedDB calls
- Use cases must not import Angular

---

## Snapshot Renderer

The renderer is a pure function (no Angular, no side effects) that takes a `Piece`
and its `Annotation[]` and returns an HTML string.

```ts
// core/infrastructure/renderer/piece-renderer.ts
function renderPiece(piece: Piece, annotations: Annotation[]): string {
  // 1. Parse anchor tags from piece.content
  // 2. For each anchor zone, render annotation elements with CSS classes
  // 3. Return complete HTML string
}
```

**Rules:**
- The renderer lives in `core/infrastructure/renderer/` — it is infrastructure, not domain
- It has no dependencies on Angular, IndexedDB, or any external service
- It can be unit tested in isolation with plain TypeScript
- All annotations are always rendered regardless of layer visibility
- Layer visibility is always handled by CSS classes, never by conditional rendering
- Rendered base-text fragments in visualization mode must expose raw-source offset metadata so the app can map DOM selections back to `Piece.content`
- Any future intelligent anchor-correction capability must be a separate adapter/port, not part of the renderer and not part of the autosave/save loop

---

## Snapshot Lifecycle

Two independent timers are used in editing mode:
- **Content autosave debounce (`800ms`)**: persists `Piece.content` and `updatedAt` after typing pauses.
- **Snapshot inactivity debounce (`5s`)**: regenerates `PieceSnapshot` after no content/annotation/anchor changes.

```
User edits content in editing mode
  → content autosave debounce (800ms)
  → increment Piece.revision and update updatedAt
  → PieceRepository.save(piece with updatedAt)
  → run anchor integrity pass for the same content revision
  → persist any derived needsReview annotation updates before any snapshot regeneration for that revision
  → snapshot inactivity debounce (5s, reset on each relevant change)
  → SnapshotInvalidationService marks snapshot as stale
  → SnapshotGenerationService generates new snapshot in background
  → SnapshotRepository.save()

User creates/edits/deletes/resolves an annotation
  → update Piece.updatedAt and increment Piece.revision
  → persist affected Piece / AnchorMark / Annotation entities through ports
  → if visualization mode is active, apply immediate overlay feedback on the current view
  → snapshot inactivity debounce (5s, reset on each relevant change)
  → SnapshotInvalidationService marks snapshot as stale
  → SnapshotGenerationService generates new snapshot in background
  → SnapshotRepository.save()

MVP persistence note:
- Multi-entity annotation flows are best-effort and sequential; no cross-repository transaction or rollback guarantee is required in MVP
- If a later persist step fails, the UI shows a visible error, keeps already-persisted state unchanged, and the automatic persistence flow retries on the next relevant save cycle

User exits editing mode with pending changes
  → immediate background snapshot generation (no wait)
  → SnapshotRepository.save()

User enters editing mode with no snapshot yet
  → trigger first background snapshot generation immediately
  → keep annotation actions disabled until the first snapshot is ready

User opens visualization mode
  → load Piece + PieceSnapshot from ports
  → if snapshot exists and is current: inject HTML into view container (no Angular rendering)
  → if snapshot exists but sourceRevision < Piece.revision: inject current HTML immediately and regenerate in background
  → if no snapshot exists: show base text in read-only mode, disable annotation actions, generate first snapshot in background
  → apply CSS hide classes based on PieceSnapshot.layerVisibility when a snapshot is available
  → maintain up to 3 rendered recovery copies per piece in the snapshot storage layer; prune the oldest copy automatically when the limit is exceeded

User toggles a layer
  → update PieceSnapshot.layerVisibility
  → add/remove CSS class on container element
  → SnapshotRepository.save() (only layerVisibility field changed)
  → zero HTML re-render
```

---

## Double-Action Protection

All user-triggered actions (save annotation, delete, resolve needsReview, create piece)
must be protected against duplicate execution from double-taps or rapid clicks.

**Rule:** Use an `isProcessing` flag or RxJS `exhaustMap` on all action triggers.
A second trigger while an action is in progress must be silently ignored.
No duplicate modals, no duplicate persists, no duplicate navigation.

---

## Testing Strategy

### What to test (required)
- **Domain logic** — pure TypeScript, no Angular, no mocks needed:
  - Anchor tag parsing and generation
  - `display` derivation for `ChordContent`
  - Annotation content validation per kind
  - Snapshot invalidation rules
- **Use cases** — with mocked port interfaces:
  - Input validation
  - Correct port method calls and sequencing
  - Cascade delete behavior

### What not to test in MVP
- Angular components (brittle, low ROI at this stage)
- IndexedDB adapters (integration test territory, not unit)
- The renderer HTML output (visual, better verified manually)

### Failure handling baseline
- Adapters may return errors or rejected promises, but use cases must translate them into simple UI outcomes
- MVP error handling stays intentionally lightweight: inline validation for bad input, banners/toasts for recoverable runtime failures, blocking screen only for fatal storage unavailability on launch

### Architecture tests
Use ESLint rules or a lightweight tool to enforce import boundaries:
- `core/domain/` imports nothing outside itself
- `core/application/` imports nothing from `core/infrastructure/` or `features/`

This prevents domain drift — the most common failure mode in hexagonal architecture.

---

## What to Avoid in MVP

- Generic repositories (`BaseRepository<T>`)
- Abstract base classes for use cases
- Event buses or CQRS patterns
- Lazy-loaded domain modules
- Any pattern that adds indirection without a concrete current benefit

---

## Future-Aware Constraints

- `Piece` has no reference to workspace, collection, or ordering
- All ports are designed so a future adapter (Google Drive, backend) replaces the IndexedDB adapter with no use case changes
- No workspace folder or file in MVP codebase

---

## Technical Roadmap (not MVP — direction only)

### Google Drive Sync
- Primary cross-device sync — no backend required
- OAuth tokens stored on device (IndexedDB or secure browser storage)
- On app start: check Drive for updates, merge with local if Drive is newer
- On create/update: write to IndexedDB immediately, sync to Drive async
- Offline: persist locally, sync on reconnect
- `SyncRepository` port defined when specced

### AI Integration (BYOK)
- No backend proxy — user provides their own API key
- Key stored on device only, never transmitted to any server owned by this project
- Context built from structured Markdown + domain metadata
- **Legal note:** before any public release, UX copy and privacy policy must clearly inform the user that keys are stored on their device only. This is the primary legal protection against liability claims.
- `AiPort` interface defined when specced

### Mobile (Android)
- Path: Angular web app → Capacitor → Android APK
- No rewrite required
- iOS only if the product grows to justify it

### Snapshot Generation Timing (user-configurable)
- On exit only (slow devices)
- After 5 seconds of inactivity (default)
- After 2 seconds of inactivity (fast devices)
- User sets preference in app settings

### Backend
- Not planned
- Hexagonal architecture ensures a backend adapter can be added without changing use cases
