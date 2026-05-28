'use client';

// ==========================================
// USE UPGRADE TO SELLER
// File: src/hooks/user/use-upgrade-to-seller.ts
//
// [SPRINT 1 — G3 FIX: getErrorMessage pakai t]
// getErrorMessage(err) → getErrorMessage(err, t) agar error key dari
// BE ditranslate sebelum ditampilkan ke user.
//
// Hook to upgrade tenant from BUYER → SELLER.
// After upgrade:
//   1. Update tenant in store (role: SELLER)
//   2. Redirect to /dashboard/products
// ==========================================

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api/client';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import type { Tenant, UpgradeToSellerInput } from '@/types/tenant';

export function useUpgradeToSeller() {
  const tToast = useTranslations('toast.upgrade');
  // [G3 FIX] t untuk getErrorMessage
  const t = useTranslations();
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

        toast.success(tToast('success'), {
          description: tToast('successDetail'),
        });

        // Redirect to seller dashboard
        router.push('/dashboard/products');

        return response;
      } catch (err) {
        // [G3 FIX] Pass t agar error key ditranslate
        const message = getErrorMessage(err, t);
        setError(message);
        toast.error(tToast('failed'), { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, router, tToast, t],
  );

  const reset = useCallback(() => setError(null), []);

  return { upgrade, isLoading, error, reset };
}
