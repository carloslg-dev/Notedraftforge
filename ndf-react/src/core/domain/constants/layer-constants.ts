/**
 * CSS class constants for layer visibility mechanism as defined in openspec/domain-model.md.
 * These are used by the piece renderer to assign classes and by the container to toggle visibility.
 */
export const LAYER_CLASSES = {
  // Hide classes applied to the piece container
  hide: {
    chord: 'ndf-hide-chord',
    meter: 'ndf-hide-meter',
    breath: 'ndf-hide-breath',
    intention: 'ndf-hide-intention',
    comments: 'ndf-hide-comments',
  },
  // Base class for all annotations
  annotationBase: 'ndf-annotation',
  // Layer-specific classes applied to individual annotation elements
  layer: {
    breath: 'ndf-layer-breath',
    intention: 'ndf-layer-intention',
    comments: 'ndf-layer-comments',
  },
  // Status classes
  needsReview: 'ndf-needs-review',
} as const;
