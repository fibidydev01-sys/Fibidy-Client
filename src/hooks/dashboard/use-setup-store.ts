'use client';

// ============================================================================
// USE SETUP STORE — Updated Hook
// File: src/hooks/dashboard/use-setup-store.ts
//
// [SETUP-GATE Phase A — May 2026]
// Updated to match new CompleteSetupInput (14 mandatory fields).
// Logic unchanged — just the type reference updates automatically
// since CompleteSetupInput is imported from @/types/tenant.
// ============================================================================

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { tenantsApi } from '@/lib/api/tenants';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import type { CompleteSetupInput } from '@/types/tenant';

export function useCompleteSetup() {
  const tToast = useTranslations('toast.setup');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const { setTenant } = useAuthStore();

  const completeSetup = useCallback(
    async (data: CompleteSetupInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await tenantsApi.completeSetup(data);

        // Update auth store — tenant.isSetupComplete is now true.
        // This lifts the setup gate in dashboard-route-guard immediately.
        setTenant(response.tenant);

        toast.success(tToast('success'), { description: tToast('successDetail') });

        // Signal done — component will show the success screen
        setIsDone(true);

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error(tToast('failed'), { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, tToast],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsDone(false);
  }, []);

  return { completeSetup, isLoading, error, isDone, reset };
}
