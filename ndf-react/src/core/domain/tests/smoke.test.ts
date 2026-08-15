import { describe, it, expect } from 'vitest';
import { LAYER_CLASSES } from '../constants/layer-constants';

describe('Smoke test', () => {
  it('verifies that the test environment is running', () => {
    expect(LAYER_CLASSES.needsReview).toBe('ndf-needs-review');
  });
});
