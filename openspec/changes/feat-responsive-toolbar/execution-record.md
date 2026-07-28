# Execution Record — feat-responsive-toolbar

---

## Task reference

Adapt Selection Toolbar to mobile layout and optimize layout spacing (#27, EM-REQ-05, EM-REQ-13)

## Change reference

feat-responsive-toolbar

## Execution authorization

Status: approved
Source: human
Approved by: carloslg-dev
Reason: User approved layout optimization to remove the double inner border card in TiptapEditor.tsx and shrink sidebar spacing to maximize writing canvas width on mobile.

---

## Context used

| Source | Why needed | Confidence |
|---|---|---|
| src/ui/features/work-view/use-work-view.ts | Implement a silent refresh callback that does not trigger loading state changes | High |
| src/core/infrastructure/editor/components/TiptapEditor.tsx | Create right-side static vertical toolbar and bind selectionUpdate/transaction events | High |
| src/ui/hooks/use-media-query.ts | Synchronously initialize layout matching state | High |
| openspec/specs/editor-modes/spec.md | Update specification behavior rules for mobile viewports | High |

---

## Files changed

- openspec/specs/editor-modes/spec.md
- openspec/specs/annotation-system/spec.md
- src/ui/hooks/use-media-query.ts
- src/core/infrastructure/editor/components/TiptapEditor.tsx
- src/ui/features/work-view/WorkViewPage.tsx
- src/ui/features/work-view/use-work-view.ts
- e2e/piece-lifecycle.spec.ts

---

## Validation result

PASS

---

## Decisions made

- Initialize `useMediaQuery` state synchronously using `window.matchMedia(query).matches` to prevent initial render mismatch in react lifecycle.
- Remove Tiptap editor border and margins on mobile devices to prevent double borders.
- Switch layout to full bleed width (100% width, no margins, rounded corners, card borders or card shadows) on mobile devices to optimize horizontal reading and writing space.
- Minimize vertical heights of headers, navbars and metadata blocks to leave maximum space for creative input.
- Remove redundant labels "Reading Preview" and "Edit Piece (Editable)" inside panels to keep flow clean.
- Implement window `visualViewport` event listener to calculate virtual keyboard height dynamically on mobile, shifting toolbar bottom offsets to stay `16px` above the keyboard.
- Shrink mobile visualization toolbar buttons (Intent, Comment, Breath) to icon-only variants, giving full clearance to the "Ajustar" button.
- Create unified `getMenuButtonProps` event helper to intercept pointerdown (`onPointerDown`) and mousedown (`onMouseDown`) events and call `e.preventDefault()`. This blocks the native touch focus shift to the toolbar buttons, keeping the editor focused and preserving the text selection for sequential style applications.
- Run style updates on `onClick` handlers to ensure the browser registers actions inside a valid user-initiated gesture context, allowing programmatic focus to succeed.
- Introduce `showMobileToolbar` state with a `500ms` hide debounce timer. If selections undergo transient updates (such as during style toggling), the toolbar remains stably visible.
- Remove the "Ajustar" (Refine) button entirely from editing mode (both desktop BubbleMenu and mobile keyboard-docked toolbar) to simplify formatting UX, retaining it exclusively in visualization mode for annotation precision.
- Discard all editor-level floating bubble menus, custom mobile bottom menus, and visual viewport listeners, replacing them with a permanently visible vertical sidebar on the right margin of the editor canvas. This provides a clean interface that never conflicts with native mobile selection menus or virtual keyboards, and stays sticky during scroll events.
- Implement a silent update mode in `useWorkView` hook. When refreshing piece state during autosave operations, the hook avoids toggling `loading = true`. This prevents React from unmounting `TiptapEditor`, retaining editor selection ranges and keyboard states.
- Defer all database refetching (`refresh()`) calls to only execute when transitioning from editing to visualization mode. During active writing, the local rich text editor memory operates as the single source of truth, avoiding state updates that cause input resetting.
- Increase the active input autosave debounce delay from `800ms` to `5000ms` (5 seconds) to decrease writing overhead and provide a stable writing environment.
- Bind `selectionUpdate` and `transaction` editor events to a custom state epoch hook in `TiptapEditor.tsx`. This causes the sidebar formatting buttons to re-render dynamically on every cursor movement or styling change, highlighting active styling choices in real-time.
- Remove duplicate inner card wrapping (borders, shadow, double margins and inner paddings) around the text canvas. This allows the editor to breathe directly inside the page card container, bleeding text to margins and expanding usable horizontal viewport width.
- Shrink vertical toolbar spacing (`w-9` sidebar width, `gap-2` outer gap, `max-w-[calc(100%-44px)]` editor area constraint) to maximize line-width options for song writing and lyrics editing on small screens.

---

## Retrospective summary

- Initializing hooks that check browser window states (like media queries) with static defaults (like `false`) can cause flickering, layout shifts, or react hydration/plugin mismatch errors on mount. Always resolve them synchronously when window is available.
- Headless test runners can sometimes fail to emit selection change events natively on simulated viewports. Manual dispatching of DOM events ensures event listeners fire predictably.
- Touch events on mobile trigger default focus transitions that differ from mouse events. Overriding touch start events via `preventDefault` is essential to maintain text selection ranges during editor interactions.
- Programmatic focus calls in iOS Safari are blocked if user-initiated pointer sequences are canceled. Resolving focus commands within standard `click` events bypasses this safety check cleanly.
- Adding a short debounce delay to floating mobile toolbars prevents layout flickering caused by temporary state changes during formatting actions.
- Discarding unnecessary refinement flows from the main editor reduces component complexity, cleans up code hooks, and simplifies the learning curve of formatting controls for users.
- Relocating formatting buttons to a right-aligned static vertical toolbar completely removes overlapping concerns with mobile OS menu bubbles, providing a robust layout for both mobile and web viewports.
- Asynchronous refreshes that update parent component records should avoid toggling general loader states during active editing sessions. Keeping loaders silent prevents component unmounting, which preserves focus context, selections, and virtual keyboard bindings.
- During active content editing in WYSIWYG rich text systems, the editor component's memory should serve as the sole source of truth. Postponing state refreshes from database transactions until mode boundaries are crossed eliminates typing delays, content overwrites, and browser refokus issues.
- React rich-text editor wrappers need event hooks linked to editor update hooks (like `selectionUpdate` or `transaction`) to prompt toolbar state refreshes. Subscribing to editor selection shifts ensures active style classes (like `bold`, `italic`, etc.) reflect the formatting of the text node currently underlying the user's cursor.
- Redundant nested container borders and margins waste significant layout space, particularly on mobile screens. Stripping secondary background panels allows writing areas to reach their full horizontal potential.

## Task log range

Single task

---

## Date completed

2026-07-28
