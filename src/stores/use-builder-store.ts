import { create } from 'zustand';

// ==========================================
// BUILDER STORE
// Shared state antara landing-builder page dan nav (sidebar/mobile)
// ==========================================

interface BuilderStore {
  hasUnsavedChanges: boolean;
  heroEnabled: boolean;
  onNavigateAway: ((href: string) => void) | null;
  setHasUnsavedChanges: (value: boolean) => void;
  setHeroEnabled: (value: boolean) => void;
  setOnNavigateAway: (fn: ((href: string) => void) | null) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderStore>((set) => ({
  hasUnsavedChanges: false,
  heroEnabled: false,
  onNavigateAway: null,
  setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),
  setHeroEnabled: (value) => set({ heroEnabled: value }),
  setOnNavigateAway: (fn) => set({ onNavigateAway: fn }),
  reset: () => set({ hasUnsavedChanges: false, heroEnabled: false, onNavigateAway: null }),
}));