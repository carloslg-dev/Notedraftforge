import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore, selectCanCreateAnnotations, selectCanToggleLayers } from './ui-store';
import type { AnnotationTarget } from '../../core/domain/types/index';

describe('useUIStore', () => {
  beforeEach(async () => {
    // Reset store before each test
    const { enterVisualization, setAnnotationModalOpen, setRefinementModalOpen, setActiveSelection } = useUIStore.getState();
    await enterVisualization();
    setAnnotationModalOpen(false);
    setRefinementModalOpen(false);
    setActiveSelection(null);
    useUIStore.setState({ activePieceId: null });
  });

  it('should initialize with visualization mode and closed modals', () => {
    const state = useUIStore.getState();
    expect(state.activeMode).toBe('visualization');
    expect(state.isAnnotationModalOpen).toBe(false);
    expect(state.isRefinementModalOpen).toBe(false);
    expect(state.activeSelection).toBeNull();
    expect(state.activePieceId).toBeNull();
    expect(selectCanCreateAnnotations(state)).toBe(true);
    expect(selectCanToggleLayers(state)).toBe(true);
  });

  it('should transition to editing mode and set piece id', () => {
    useUIStore.getState().enterEditing('piece-123');
    const state = useUIStore.getState();
    expect(state.activeMode).toBe('editing');
    expect(state.activePieceId).toBe('piece-123');
    expect(selectCanCreateAnnotations(state)).toBe(false);
    expect(selectCanToggleLayers(state)).toBe(false);
  });

  it('should transition to visualization mode and clear piece id', async () => {
    useUIStore.getState().enterEditing('piece-123');
    await useUIStore.getState().enterVisualization();
    const state = useUIStore.getState();
    expect(state.activeMode).toBe('visualization');
    expect(state.activePieceId).toBeNull();
    expect(selectCanCreateAnnotations(state)).toBe(true);
    expect(selectCanToggleLayers(state)).toBe(true);
  });

  it('should await savePendingContent callback before transitioning to visualization', async () => {
    let called = false;
    useUIStore.getState().enterEditing('piece-123');
    await useUIStore.getState().enterVisualization(async () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          called = true;
          resolve();
        }, 10);
      });
    });
    const state = useUIStore.getState();
    expect(called).toBe(true);
    expect(state.activeMode).toBe('visualization');
  });

  it('should toggle annotation modal in visualization mode', () => {
    useUIStore.getState().setAnnotationModalOpen(true);
    let state = useUIStore.getState();
    expect(state.isAnnotationModalOpen).toBe(true);

    useUIStore.getState().setAnnotationModalOpen(false);
    state = useUIStore.getState();
    expect(state.isAnnotationModalOpen).toBe(false);
  });

  it('should block opening annotation modal in editing mode', () => {
    useUIStore.getState().enterEditing('piece-123');
    useUIStore.getState().setAnnotationModalOpen(true);
    const state = useUIStore.getState();
    expect(state.isAnnotationModalOpen).toBe(false);
  });

  it('should allow closing annotation modal in editing mode if it was somehow open', () => {
    // Manually force state to test closing logic
    useUIStore.setState({ isAnnotationModalOpen: true, activeMode: 'editing' });
    useUIStore.getState().setAnnotationModalOpen(false);
    const state = useUIStore.getState();
    expect(state.isAnnotationModalOpen).toBe(false);
  });

  it('should toggle refinement modal', () => {
    useUIStore.getState().setRefinementModalOpen(true);
    let state = useUIStore.getState();
    expect(state.isRefinementModalOpen).toBe(true);

    useUIStore.getState().setRefinementModalOpen(false);
    state = useUIStore.getState();
    expect(state.isRefinementModalOpen).toBe(false);
  });

  it('should set active selection', () => {
    const mockSelection: AnnotationTarget = {
      kind: 'text-range',
      blockId: 'block-1',
      startOffset: 0,
      endOffset: 5,
    };

    useUIStore.getState().setActiveSelection(mockSelection);
    let state = useUIStore.getState();
    expect(state.activeSelection).toEqual(mockSelection);

    useUIStore.getState().setActiveSelection(null);
    state = useUIStore.getState();
    expect(state.activeSelection).toBeNull();
  });
});
