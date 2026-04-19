'use client';

// ==========================================
// ONBOARD REFRESH CLIENT
// File: src/app/[locale]/onboard/refresh/client.tsx
//
// Stripe Connect onboarding return flow — when buyer's session expires
// mid-onboarding, Stripe redirects here. We re-initiate KYC to get a
// fresh onboarding URL and bounce them back into the Stripe flow.
// On error: redirect back to settings with ?kyc=error query param.
//
// [i18n FIX — 2026-04-19]
// Two changes:
//
// 1. `useRouter` now imported from `@/i18n/navigation` instead of
//    `next/navigation`. The next-intl wrapper auto-prefixes routes with
//    the active locale, so a user who lands on `/id/onboard/refresh` and
//    then fails to start KYC gets bounced to `/id/dashboard/settings?kyc=error`
//    instead of `/dashboard/settings?kyc=error` (which would lose the
//    locale context).
//
// 2. The "Refreshing verification link..." string is resolved via
//    `useTranslations('dashboard.onboard')` → key `refreshing`.
// ==========================================

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { productsApi } from '@/lib/api/products';
import { Loader2 } from 'lucide-react';

export function OnboardRefreshClient() {
  const t = useTranslations('dashboard.onboard');
  const router = useRouter();

  useEffect(() => {
    productsApi
      .initiateKyc()
      .then(({ onboardingUrl }) => {
        // External URL (Stripe) — use window.location directly.
        // next-intl's router.push() only handles internal routes.
        window.location.href = onboardingUrl;
      })
      .catch(() => {
        router.push({
          pathname: '/dashboard/settings',
          query: { kyc: 'error' },
        });
      });
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {t('refreshing')}
      </p>
    </div>
  );
}