'use client';

// ============================================================================
// SELLER SETUP DONE
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-done.tsx
//
// [TYPECHECK FIX — May 2026]
// Hapus prop icon dan iconTone — sudah tidak ada di MandatoryDialog
// setelah Lottie update (icon digantikan animasi Lottie).
// ============================================================================

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
import { MandatoryDialog } from '@/components/ui/mandatory-dialog';
import { storeAbsoluteUrl } from '@/lib/public/store-url';
import { useRouter } from '@/i18n/navigation';

export function SellerSetupDone() {
  const t = useTranslations('dashboard.setupStore.seller.done.goToStudioDialog');
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);

  const handleContinueToStudio = () => {
    router.push('/dashboard/studio');
  };

  const showPreviewCta = tenant?.slug && tenant?.hasPublishedOnce === true;

  return (
    <MandatoryDialog
      open={true}
      title={t('title')}
      description={t('description')}
      secondaryCta={
        showPreviewCta
          ? { label: t('ctaPreview'), href: storeAbsoluteUrl(tenant!.slug) }
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
