'use client';

// ============================================================================
// SELLER SETUP DONE — Sprint 3 Update
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-done.tsx
//
// [SPRINT 3 — U10 FIX: Defer preview CTA untuk store kosong]
// Sebelumnya: "Lihat toko dulu" secondary CTA selalu ditampilkan setelah
// setup selesai. Masalah: store baru = 0 produk → user klik → lihat store
// kosong → first impression jelek.
//
// Fix: tampilkan secondary CTA "Lihat toko dulu" HANYA jika tenant
// sudah pernah publish (hasPublishedOnce === true).
//
// [TYPECHECK FIX — May 2026]
// Hapus prop icon dan iconTone — MandatoryDialog sudah tidak terima props ini
// setelah Lottie update (icon digantikan Lottie animation).
// ============================================================================

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { MandatoryDialog } from '@/components/ui/mandatory-dialog';

export function SellerSetupDone() {
  const t = useTranslations('dashboard.setupStore.seller.done.goToStudioDialog');
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);

  const handleContinueToStudio = () => {
    router.push('/dashboard/studio');
  };

  // [U10 FIX] Hanya tampilkan "Lihat toko dulu" jika tenant sudah pernah publish.
  // Store baru (hasPublishedOnce falsy) = kosong = first impression jelek.
  // Setelah user publish produk pertama dari Studio, hasPublishedOnce = true.
  const showPreviewCta = tenant?.slug && tenant?.hasPublishedOnce === true;

  return (
    <MandatoryDialog
      open={true}
      title={t('title')}
      description={t('description')}
      secondaryCta={
        showPreviewCta
          ? {
              label: t('ctaPreview'),
              href: `/store/${tenant!.slug}`,
            }
          : undefined
      }
      primaryCta={{
        label: t('cta'),
        onClick: handleContinueToStudio,
      }}
      testId="setup-done-dialog"
    />
  );
}
