'use client';

// ==========================================
// USE UPGRADE TO SELLER
//
// Hook untuk upgrade tenant dari BUYER → SELLER.
// Dipanggil dari /dashboard/setup-store setelah wizard selesai.
//
// Setelah upgrade:
//   1. Update tenant di store (role: SELLER, slug proper, dll)
//   2. Redirect ke /dashboard/products
//   3. Sidebar terbuka penuh
//   4. Library tetap ada — akun sama
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

        // Update tenant di store — role sekarang SELLER
        setTenant(response.tenant);

        toast.success('Selamat!', {
          description: 'Toko kamu sudah aktif. Mulai jual produk sekarang!',
        });

        // Redirect ke dashboard seller
        router.push('/dashboard/products');

        return response;
      } catch (err) {
        const message = getErrorMessage(err);
        setError(message);
        toast.error('Upgrade gagal', { description: message });
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