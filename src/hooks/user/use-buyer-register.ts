'use client';

// ==========================================
// USE BUYER REGISTER
//
// Hook untuk register buyer dari AuthDialog di /discover.
// Setelah register:
//   1. Set tenant ke store (isAuthenticated = true)
//   2. Tutup dialog
//   3. User langsung bisa klik "Beli" tanpa redirect
//
// Tidak ada redirect — user tetap di halaman produk.
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

        toast.success('Pendaftaran berhasil!', {
          description: 'Kamu sekarang bisa membeli produk.',
        });

        // Tutup dialog — tetap di halaman produk
        close();

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Pendaftaran gagal', { description: message });
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