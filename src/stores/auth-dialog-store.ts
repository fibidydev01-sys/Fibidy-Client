'use client';

// ==========================================
// AUTH DIALOG STORE
//
// Zustand kecil — hanya kontrol buka/tutup dialog auth
// di halaman /discover.
//
// Trigger: buy-button.tsx → open()
// Consumer: auth-dialog.tsx → isOpen, close
// Mount: discover/layout.tsx → <AuthDialog />
// ==========================================

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