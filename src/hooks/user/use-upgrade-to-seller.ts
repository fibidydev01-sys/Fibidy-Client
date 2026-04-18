'use client';

// ==========================================
// USE UPGRADE TO SELLER
//
// Hook to upgrade tenant from BUYER → SELLER.
// Called from /dashboard/setup-store after wizard completes.
//
// After upgrade:
//   1. Update tenant in store (role: SELLER, proper slug, etc.)
//   2. Redirect to /dashboard/products
//   3. Sidebar fully unlocked
//   4. Library preserved — same account
// ==========================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Tenant, UpgradeToSellerInput } from '@/types/tenant';

export function useUpgradeToSeller() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTenant } = useAuthStore();
  const router = useRouter();

  const upgrade = useCallback(
    async (data: UpgradeToSellerInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await api.patch<{ message: string; tenant: Tenant }>(
          '/tenants/upgrade-to-seller',
          data,
        );

        // Update tenant in store — role is now SELLER
        setTenant(response.tenant);

        toast.success('Congratulations!', {
          description: 'Your store is live. Start selling products now!',
        });

        // Redirect to seller dashboard
        router.push('/dashboard/products');

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Upgrade failed', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, router],
  );

  const reset = useCallback(() => setError(null), []);

  return { upgrade, isLoading, error, reset };
}