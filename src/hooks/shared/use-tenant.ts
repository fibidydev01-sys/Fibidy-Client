'use client';

import { useCallback } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';

// ==========================================
// USE TENANT
// Get current authenticated tenant
// ==========================================

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
        console.error('Failed to refresh tenant:', err);
      }
    }
  }, [isAuthenticated, setTenant]);

  return { tenant, refresh };
}