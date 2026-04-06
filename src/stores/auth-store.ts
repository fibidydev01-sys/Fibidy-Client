'use client';

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