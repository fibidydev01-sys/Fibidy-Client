'use client';

// ============================================================================
// AUTH STORE
// File: src/stores/auth-store.ts
//
// [SPRINT 1 — A-S1 FIX: reset() clear localStorage]
// useLogout memanggil reset(), tapi reset() sebelumnya tidak clear
// localStorage 'fibidy_token'. Padahal handleUnauthorized di client.ts
// melakukan removeItem. Inconsistency ini bisa menyebabkan stale token
// tersisa setelah logout normal (bukan karena 401).
//
// Fix: pindahkan localStorage.removeItem ke dalam reset() agar semua
// code path yang call reset() (logout, 401, dll) auto-clear token.
// ============================================================================

import { create } from 'zustand';
import { useSyncExternalStore } from 'react';
import type { Tenant } from '@/types/tenant';

// ==========================================
// AUTH STORE TYPES
// ==========================================

interface AuthState {
  tenant: Tenant | null;
  isLoading: boolean;
  isChecked: boolean;
}

interface AuthActions {
  setTenant: (tenant: Tenant | null) => void;
  setLoading: (loading: boolean) => void;
  setChecked: (checked: boolean) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// ==========================================
// AUTH STORE
// ==========================================

export const useAuthStore = create<AuthStore>()((set) => ({
  tenant: null,
  isLoading: true,
  isChecked: false,

  setTenant: (tenant) => {
    set({ tenant, isLoading: false });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setChecked: (isChecked) => {
    set({ isChecked, isLoading: false });
  },

  reset: () => {
    // [A-S1 FIX] Clear localStorage fibidy_token saat reset.
    // Sebelumnya hanya di-clear oleh handleUnauthorized (401 path).
    // Logout normal via useLogout → reset() melewatkan ini.
    // Sekarang semua code path yang call reset() auto-clear token.
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fibidy_token');
      }
    } catch {
      // Ignore — private browsing atau storage disabled
    }

    set({
      tenant: null,
      isLoading: false,
      isChecked: true,
    });
  },
}));

// ==========================================
// UNAUTHORIZED EVENT LISTENER
// Listen for 401 events from API client
// ==========================================

if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().reset();
  });
}

// ==========================================
// HYDRATION-SAFE HOOKS
// ==========================================

const subscribe = (callback: () => void) => {
  return useAuthStore.subscribe(callback);
};

const emptySubscribe = () => () => { };

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !!useAuthStore.getState().tenant,
    () => false,
  );
}

export function useAuthChecked(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => useAuthStore.getState().isChecked,
    () => false,
  );
}

export function useAuthHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
