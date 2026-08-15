import { create } from 'zustand';
import type { AnnotationTarget } from '../../core/domain/types/index';

interface UIState {
  activeMode: 'visualization' | 'editing';
  activePieceId: string | null;
  isAnnotationModalOpen: boolean;
  isRefinementModalOpen: boolean;
  activeSelection: AnnotationTarget | null;
  uiLanguage: 'es' | 'en';
}

interface UIActions {
  enterEditing: (pieceId: string) => void;
  enterVisualization: (savePendingContent?: () => Promise<void> | void) => Promise<void>;
  setAnnotationModalOpen: (isOpen: boolean) => void;
  setRefinementModalOpen: (isOpen: boolean) => void;
  setActiveSelection: (selection: AnnotationTarget | null) => void;
  setUILanguage: (lang: 'es' | 'en') => void;
}

export type UIStore = UIState & UIActions;

export const selectCanCreateAnnotations = (state: UIStore) => state.activeMode === 'visualization';
export const selectCanToggleLayers = (state: UIStore) => state.activeMode === 'visualization';

export const useUIStore = create<UIStore>((set, get) => ({
  activeMode: 'visualization',
  activePieceId: null,
  isAnnotationModalOpen: false,
  isRefinementModalOpen: false,
  activeSelection: null,
  uiLanguage: 'es',

  enterEditing: (pieceId: string) =>
    set({
      activeMode: 'editing',
      activePieceId: pieceId,
      isAnnotationModalOpen: false,
    }),

  enterVisualization: async (savePendingContent?: () => Promise<void> | void) => {
    if (savePendingContent) {
      await savePendingContent();
    }
    set({
      activeMode: 'visualization',
      activePieceId: null,
    });
  },

  setAnnotationModalOpen: (isOpen: boolean) => {
    const { activeMode } = get();
    if (activeMode === 'editing' && isOpen) {
      return; // Block opening annotation modal in editing mode
    }
    set({ isAnnotationModalOpen: isOpen });
  },

  setRefinementModalOpen: (isOpen: boolean) => set({ isRefinementModalOpen: isOpen }),
  setActiveSelection: (selection: AnnotationTarget | null) => set({ activeSelection: selection }),
  setUILanguage: (lang: 'es' | 'en') => set({ uiLanguage: lang }),
}));
