# Non-Functional Requirements — NoteDraftForge

> These requirements apply across all features unless a specific spec states otherwise.
> They are not optional — they are acceptance criteria for the MVP.

---

## Performance

### Visualization load time
- A piece must be visible to the user in under **1 second** from the moment they tap it in the list
- This is achieved via pre-rendered PieceSnapshot loaded from IndexedDB — no Angular render pipeline on open
- If no snapshot exists (new piece), show plain text immediately and a non-blocking indicator while the snapshot is generated in the background

### Layer toggle response
- Toggling a layer must be **instantaneous** (imperceptible delay)
- Achieved via CSS class toggle only — no HTML re-render, no IndexedDB read on toggle

### Snapshot generation
- Must not block the UI — always runs in the background
- Triggered after 5 seconds of inactivity or on exit from editing mode
- If no snapshot exists on first visualization open, generation starts immediately in background
- If a snapshot is stale on visualization open, the stale view remains visible while regeneration starts immediately in background
- Snapshot generation must not block typing, scrolling, or interaction

### Editing responsiveness
- The Markdown editor must feel native — keystrokes must register with no perceptible lag
- Anchor integrity checks must preserve typing responsiveness
- A short delay before the final `needsReview` status update is acceptable if the user keeps immediate, in-place feedback in the current view
- The system must not require navigation or manual refresh for the user to understand the final integrity result

---

## DOM and Memory

### DOM size
- The visualization view injects static HTML — no live Angular components over the text content
- Annotation elements use CSS `display: none` for hidden layers — they remain in the DOM but are not painted
- The total number of DOM nodes for a typical piece (50 annotations) must not cause perceptible slowdown on a mid-range Android device (2020 or later)

### Memory
- No memory leaks from Angular change detection on visualization view
- The piece HTML injected into the view container must be fully destroyed when the user navigates away

---

## Offline and Data Safety

### Offline first
- The app must be fully functional with no network connection
- All reads and writes go to IndexedDB — no network dependency in MVP

### Data loss prevention
- Unsaved changes in editing mode are never lost silently
- On navigation away from editing mode, changes are persisted before the view is destroyed
- If IndexedDB write fails, the user must see an error — silent failure is not acceptable

### IndexedDB failure
- If IndexedDB is unavailable on launch (e.g. private browsing mode in some browsers), the app must show a clear error explaining that local storage is required
- The app must not crash silently

### Error policy (MVP)

| Failure type | Required response |
|---|---|
| Import file read failure | Skip only the failing file and show a non-blocking per-file message |
| IndexedDB write failure during normal use | Show a visible error/banner immediately; never fail silently |
| Snapshot generation failure | Keep the last usable snapshot or base text visible and show a non-blocking warning |
| Invalid annotation input | Show inline validation in the modal; do not persist invalid data |
| Multi-entity annotation persistence failure | Show a visible error, keep the last successfully persisted state, and let the automatic persistence flow retry on the next save cycle; no rollback is required in MVP |

---

## Rendering correctness

### Anchor tag stripping on export
- Exported `.md` files must never contain anchor tags (`<!--a1s-->` etc.)
- This must be verified: export output must match clean Markdown source

### Annotation visibility
- A `needsReview` annotation must always be visible to the user — never hidden regardless of layer visibility state
- The CSS rule `:not(.ndf-needs-review)` on hide classes ensures this at render level
- If its layer is toggled off, the annotation still shows with its warning indicator
- This applies in both visualization and editing mode

---

## Accessibility (baseline)

- All interactive elements (buttons, toggles, FAB) must be keyboard accessible
- Tap targets on mobile must be at least 44x44px (Apple HIG / Material Design minimum)
- Layer toggle labels must be readable by screen readers (ARIA labels)
- Color must not be the only means of conveying annotation kind or layer — shape or label must also differentiate

---

## Supported environments (MVP)

| Environment | Support level |
|---|---|
| Chrome (desktop, latest) | Primary — fully supported |
| Firefox (desktop, latest) | Supported |
| Safari (desktop, latest) | Supported |
| Chrome (Android, 2020+) | Supported |
| Safari (iOS) | Not in MVP |
| Capacitor (Android APK) | Future |

---

## Limits (MVP — no hard enforcement, but design must not break beyond these)

| Entity | Practical limit | Notes |
|---|---|---|
| Pieces per user | ~500 | IndexedDB has no enforced limit; list performance may degrade beyond this |
| Annotations per piece | ~200 | Renderer and DOM must remain performant |
| AnchorMarks per piece | ~100 | Same constraint as annotations |
| Content length per piece | ~50,000 chars | Approx. 10,000 words — more than any song or poem |
| Tags per piece | ~20 | No enforcement, UI may wrap gracefully |

---

## Future (not MVP)
- Configurable snapshot generation timing (on-exit / 5s / 2s / custom)
- Web Worker for snapshot rendering on large pieces
- PWA offline manifest
- iOS support via Capacitor
