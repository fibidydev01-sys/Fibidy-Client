'use client';

// ==========================================
// USE BUYER REGISTER
// File: src/hooks/user/use-buyer-register.ts
//
// Hook for buyer registration from AuthDialog on /discover.
// After register:
//   1. Set tenant to store (isAuthenticated = true)
//   2. Close dialog
//   3. User can immediately click "Buy" without redirect
//
// No redirect — user stays on product page.
//
// [i18n FIX — 2026-04-19]
// Toast title + description wired to `toast.auth.*`. JSON keys used:
//   - registerSuccess            (title — shared with seller register)
//   - registerBuyerSuccessDetail (buyer-specific: "You can now purchase...")
//   - registerFailed
//
// Error state (`setError(message)`) stays as passthrough — the inline
// Alert in DialogRegisterForm renders it directly. Backend error
// messages are English in Phase 1.
// ==========================================

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { useAuthDialogStore } from '@/stores/auth-dialog-store';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import type { RegisterBuyerInput } from '@/types/auth';

export function useBuyerRegister() {
  const tToast = useTranslations('toast.auth');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setTenant, setChecked } = useAuthStore();
  const { close } = useAuthDialogStore();

  const registerBuyer = useCallback(
    async (data: RegisterBuyerInput) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authApi.registerBuyer(data);

        setTenant(response.tenant);
        setChecked(true);

        toast.success(tToast('registerSuccess'), {
          description: tToast('registerBuyerSuccessDetail'),
        });

        // Close dialog — stay on product page
        close();

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error(tToast('registerFailed'), { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, close, tToast],
  );

  const reset = useCallback(() => setError(null), []);

  return { registerBuyer, isLoading, error, reset };
}