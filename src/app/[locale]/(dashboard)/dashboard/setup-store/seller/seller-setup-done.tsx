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
// Untuk tenant baru (hasPublishedOnce belum true atau undefined):
//   - Secondary CTA disembunyikan
//   - Primary CTA "Lanjut ke Studio" tetap ditampilkan
//   - Setelah user tambah produk dan publish dari Studio → store siap dilihat
//
// Kenapa pakai hasPublishedOnce bukan products.total > 0:
//   - hasPublishedOnce sudah tersedia di tenant object dari auth store
//   - Tidak perlu fetch tambahan untuk data ini
//   - Semantiknya tepat: "pernah publish" = store pernah aktif = layak dilihat
//
// [PHASE D · POST-AUDIT carry-forward — May 2026]
// Shell dikonsolidasi ke MandatoryDialog.
// ============================================================================

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Palette } from 'lucide-react';
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
      icon={Palette}
      iconTone="primary"
      title={t('title')}
      description={t('description')}
      // [U10 FIX] Secondary CTA kondisional — hanya muncul jika store sudah pernah publish
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
