'use client';

// ==========================================
// USE BUYER REGISTER
// File: src/hooks/user/use-buyer-register.ts
//
// [SPRINT 1 — G3 FIX: getErrorMessage pakai t]
// getErrorMessage(err) → getErrorMessage(err, t) agar error key dari
// BE ditranslate sebelum ditampilkan ke user di Alert inline form.
//
// Hook for buyer registration from AuthDialog on /discover.
// After register:
//   1. Set tenant to store (isAuthenticated = true)
//   2. Close dialog
//   3. User can immediately click "Buy" without redirect
//
// No redirect — user stays on product page.
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
  // [G3 FIX] t untuk getErrorMessage
  const t = useTranslations();
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
        // [G3 FIX] Pass t agar error key ditranslate
        const message = getErrorMessage(err, t);
        setError(message);
        toast.error(tToast('registerFailed'), { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, close, tToast, t],
  );

  const reset = useCallback(() => setError(null), []);

  return { registerBuyer, isLoading, error, reset };
}
