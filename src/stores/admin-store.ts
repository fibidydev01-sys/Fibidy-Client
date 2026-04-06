'use client';

// ==========================================
// ADMIN STORE
// File: src/stores/admin-store.ts
//
// Pattern IDENTIK dengan src/stores/auth-store.ts:
// - Tidak pakai zustand persist
// - Tidak simpan token (token ada di httpOnly cookie)
// - useSyncExternalStore untuk hydration-safe hooks
// - Event listener untuk unauthorized
// ==========================================

import { create } from 'zustand';
import { useSyncExternalStore } from 'react';
import type { Admin } from '@/types/admin';

// ==========================================
// STORE TYPES
// ==========================================

interface AdminState {
  admin: Admin | null;
  isLoading: boolean;
  isChecked: boolean;
}

interface AdminActions {
  setAdmin: (admin: Admin | null) => void;
  setLoading: (loading: boolean) => void;
  setChecked: (checked: boolean) => void;
  reset: () => void;
}

type AdminStore = AdminState & AdminActions;

// ==========================================
// STORE
// ==========================================

export const useAdminStore = create<AdminStore>()((set) => ({
  admin: null,
  isLoading: true,
  isChecked: false,

  setAdmin: (admin) => {
    set({ admin, isLoading: false });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setChecked: (isChecked) => {
    set({ isChecked, isLoading: false });
  },

  reset: () => {
    set({
      admin: null,
      isLoading: false,
      isChecked: true,
    });
  },
}));

// ==========================================
// UNAUTHORIZED EVENT LISTENER
// Listen for 401 events dari adminApiClient
// ==========================================

if (typeof window !== 'undefined') {
  window.addEventListener('admin:unauthorized', () => {
    useAdminStore.getState().reset();
  });
}

// ==========================================
// HYDRATION-SAFE HOOKS
// ==========================================

const subscribe = (callback: () => void) => {
  return useAdminStore.subscribe(callback);
};

export function useIsAdminAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !!useAdminStore.getState().admin,
    () => false,
  );
}

export function useAdminChecked(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => useAdminStore.getState().isChecked,
    () => false,
  );
}

export function useAdminLoading(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => useAdminStore.getState().isLoading,
    () => true,
  );
}