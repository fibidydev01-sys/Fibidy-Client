'use client';

// ============================================================================
// SELLER SETUP DONE — Success Screen
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-done.tsx
//
// Shown after completeSetup() succeeds.
// CTAs: Add First Product → /dashboard/products
//       Preview Store → opens storefront in new tab
// ============================================================================

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Package, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

export function SellerSetupDone() {
  const t = useTranslations('dashboard.setupStore.seller.done');
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-8 py-16">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center ring-4 ring-emerald-500/10">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>

      {/* Copy */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{t('heading')}</h2>
        <p className="text-muted-foreground max-w-xs">{t('subheading')}</p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Button
          className="flex-1 gap-2"
          onClick={() => router.push('/dashboard/products')}
        >
          <Package className="h-4 w-4" />
          {t('ctaAddProduct')}
        </Button>

        {tenant?.slug && (
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() =>
              window.open(`https://${tenant.slug}.fibidy.com`, '_blank')
            }
          >
            <Eye className="h-4 w-4" />
            {t('ctaViewStore')}
          </Button>
        )}
      </div>

    </div>
  );
}
