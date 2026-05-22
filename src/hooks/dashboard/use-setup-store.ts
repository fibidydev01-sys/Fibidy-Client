'use client';

// ============================================================================
// USE SETUP STORE
// File: src/hooks/dashboard/use-setup-store.ts
//
// [PHASE C — May 2026]
// On completeSetup success → isDone:true → success screen shows.
// Success screen CTA redirects to /dashboard/studio (NOT /products).
// Flow: setup-store → studio (publish) → products (with empty state dialog).
//
// CompleteSetupInput now includes hasPhysicalLocation + locationLat/Lng
// — type reference auto-updates via @/types/tenant import.
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

        toast.success(tToast('success'), {
          description: tToast('successDetail'),
        });

        // Signal done — component shows the success screen with CTA → studio
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
