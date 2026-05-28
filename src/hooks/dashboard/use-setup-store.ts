'use client';

// ============================================================================
// USE SETUP STORE
// File: src/hooks/dashboard/use-setup-store.ts
//
// [SPRINT 1 — G3 FIX: getErrorMessage pakai t]
// getErrorMessage(err) → getErrorMessage(err, t) agar error key dari
// BE ditranslate sebelum ditampilkan ke user.
//
// [PHASE C — May 2026]
// On completeSetup success → isDone:true → success screen shows.
// Success screen CTA redirects to /dashboard/studio.
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
  // [G3 FIX] t untuk getErrorMessage
  const t = useTranslations();
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
        setTenant(response.tenant);

        toast.success(tToast('success'), {
          description: tToast('successDetail'),
        });

        setIsDone(true);

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
    [setTenant, tToast, t],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsDone(false);
  }, []);

  return { completeSetup, isLoading, error, isDone, reset };
}
