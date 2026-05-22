'use client';

// ============================================================================
// USE TENANT — Unified
// File: src/hooks/dashboard/use-tenant.ts
//
// Merger dari:
//   hooks/shared/use-tenant.ts   → useTenant() (baca + refresh auth store)
//   hooks/dashboard/use-tenant.ts → useUpdateTenant() (PATCH ke API)
//
// Tambahan Phase C:
//   usePrivateTenant() → fetch fresh tenant data dari API (bukan hanya store)
//                        Dipakai di studio/page.tsx dan products/client.tsx
//                        untuk baca hasPublishedOnce + dismissedFirstProductDialog
//
// Setelah merger ini, hooks/shared/use-tenant.ts DIHAPUS.
// Import path yang lama (@/hooks/shared/use-tenant) diupdate ke
// @/hooks/dashboard/use-tenant di 6 file berikut:
//   - studio/page.tsx
//   - settings/about.tsx
//   - settings/contact.tsx
//   - settings/hero.tsx
//   - settings/password.tsx
//   - settings/social.tsx
// ============================================================================

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useIsAuthenticated } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import type { UpdateTenantInput } from '@/types/tenant';

// ============================================================================
// USE TENANT
// Baca tenant dari auth store + refresh dari API.
// Dipakai di settings, studio, dan komponen yang butuh tenant terkini
// dari store (tidak perlu fresh fetch setiap render).
// ============================================================================

export function useTenant() {
  const { tenant, setTenant } = useAuthStore();
  const isAuthenticated = useIsAuthenticated();

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await tenantsApi.me();
      setTenant(data);
      return data;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[useTenant] Failed to refresh tenant:', err);
      }
    }
  }, [isAuthenticated, setTenant]);

  return { tenant, refresh };
}

// ============================================================================
// USE PRIVATE TENANT
// Fetch fresh tenant data dari API via TanStack Query.
// Dipakai di halaman yang butuh field private terbaru dari DB:
//   - studio/page.tsx   → hasPublishedOnce
//   - products/client.tsx → dismissedFirstProductDialog
//
// Berbeda dengan useTenant() yang baca dari auth store (mungkin stale),
// usePrivateTenant() selalu fetch dari API dan cache via TanStack.
// ============================================================================

export function usePrivateTenant() {
  return useQuery({
    queryKey: ['tenant', 'private'],
    queryFn: () => tenantsApi.me(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

// ============================================================================
// USE UPDATE TENANT
// PATCH tenant data ke API + update auth store.
// Dipakai di settings, products/client.tsx (dismiss dialog), dll.
// ============================================================================

export function useUpdateTenant() {
  const { setTenant } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTenant = useCallback(
    async (data: UpdateTenantInput) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await tenantsApi.update(data);
        setTenant(result.tenant);
        return result;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant],
  );

  return { updateTenant, isLoading, error };
}
