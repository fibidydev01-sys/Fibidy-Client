'use client';

// ============================================================================
// SETUP STORE CLIENT
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx
//
// [PANGKAS PRODUK DIGITAL] File ini dulu memuat BuyerUpgradeWizard — wizard
// 4 langkah untuk mengubah akun BUYER menjadi seller. Peran BUYER hanya ada
// untuk membeli produk digital dan sudah dicabut sampai ke enum-nya, jadi
// yang tersisa cuma satu jalur: seller yang belum menyelesaikan setup toko.
// ============================================================================

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { SellerSetupWizard } from './seller/seller-setup-wizard';
import { useRouter } from '@/i18n/navigation';

export function SetupStoreClient() {
  const tenant = useAuthStore((s) => s.tenant);
  const router = useRouter();

  const isSetupComplete = tenant?.isSetupComplete === true;

  // Redirect dijalankan di effect, bukan saat render — memanggil
  // router.replace() langsung di body komponen memicu peringatan React
  // "Cannot update a component while rendering a different component".
  useEffect(() => {
    if (isSetupComplete) {
      router.replace('/dashboard/studio');
    }
  }, [isSetupComplete, router]);

  if (!tenant || isSetupComplete) return null;

  return <SellerSetupWizard />;
}
