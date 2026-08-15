/**
 * CSS Class constants for rendering and layer visibility
 *
 * These constants enforce the CSS visibility mechanism defined in the domain model,
 * allowing the renderer and UI to share the same class contracts without React
 * dependency in the domain.
 *
 * @see openspec/domain-model.md (CSS visibility mechanism)
 */
export const NDF_CLASSES = {
  /** Applied to the piece container */
  piece: 'ndf-piece',

  /** Applied to annotation elements */
  annotation: 'ndf-annotation',

  /** Applied to annotations that need review */
  needsReview: 'ndf-needs-review',

  /** Prefix for layer kind (e.g., ndf-layer-breath) */
  layerPrefix: 'ndf-layer-',

  /** Prefix for song cell properties (e.g., ndf-song-cell-chord) */
  songCellPrefix: 'ndf-song-cell-',

  /** Prefix applied to piece container to hide a layer (e.g., ndf-hide-breath) */
  hidePrefix: 'ndf-hide-',
} as const;
