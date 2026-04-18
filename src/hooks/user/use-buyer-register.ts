'use client';

// ==========================================
// USE BUYER REGISTER
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
import { useAuthStore } from '@/stores/auth-store';
import { useAuthDialogStore } from '@/stores/auth-dialog-store';
import { authApi } from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import type { RegisterBuyerInput } from '@/types/auth';

export function useBuyerRegister() {
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

        toast.success('Registration successful!', {
          description: 'You can now purchase products.',
        });

        // Close dialog — stay on product page
        close();

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Registration failed', { description: message });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [setTenant, setChecked, close],
  );

  const reset = useCallback(() => setError(null), []);

  return { registerBuyer, isLoading, error, reset };
}