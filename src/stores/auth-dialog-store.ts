'use client';

// ============================================================================
// AUTH DIALOG STORE
// File: src/stores/auth-dialog-store.ts
//
// [SPRINT 4 — C1 FIX: Close dialog saat auth:unauthorized]
// Sebelumnya: jika session expire saat AuthDialog masih terbuka (user sedang
// di tab /discover dan session tiba-tiba invalid), dialog tetap terbuka di
// atas meski user sudah di-redirect ke /login. Ini menyebabkan stale UI.
//
// Fix: tambah listener untuk event 'auth:unauthorized' yang di-dispatch oleh
// lib/api/client.ts saat BE return 401. Saat event diterima → close dialog.
//
// Listener dipasang di module level (bukan di dalam komponen) agar:
//   - Hanya satu listener untuk seluruh lifetime app
//   - Tidak bergantung pada komponen AuthDialog yang mungkin tidak di-render
//   - Konsisten dengan pola yang sama di auth-store.ts
// ============================================================================

import { create } from 'zustand';

interface AuthDialogStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useAuthDialogStore = create<AuthDialogStore>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

// [C1 FIX] Listen untuk auth:unauthorized event — close dialog jika terbuka.
// Event di-dispatch oleh lib/api/client.ts handleUnauthorized() saat BE return 401.
// Ini mencegah stale AuthDialog terbuka setelah session expire.
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    const state = useAuthDialogStore.getState();
    if (state.isOpen) {
      state.close();
    }
  });
}
