'use client';

// ============================================================================
// ONBOARD (KYC) PAGE — EDU-AWARE WRAPPER
// File: src/app/[locale]/(dashboard)/dashboard/onboard/page.tsx
//
// [PHASE F · SPRINT 3 — May 2026]
// EDU users see EduRestrictedPage instead of silent redirect.
//
// INTEGRATION:
// Replace the placeholder below with your existing onboard/KYC content component.
// import { OnboardPageContent } from '@/components/dashboard/onboard/onboard-page-content';
// ============================================================================

import { useAuthStore } from '@/stores/auth-store';
import { EduRestrictedPage } from '@/components/dashboard/shared/edu-restricted-page';

// TODO: replace with your actual onboard content component import
// import { OnboardPageContent } from '@/components/dashboard/onboard/onboard-page-content';

export default function OnboardPage() {
  const tenant = useAuthStore((s) => s.tenant);

  if (tenant?.isEduMode === true) {
    return <EduRestrictedPage type="onboard" />;
  }

  // Normal SELLER flow — render existing onboard content:
  // return <OnboardPageContent />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Onboard</h1>
      <p className="text-muted-foreground mt-2">
        [Replace with your existing OnboardPageContent component]
      </p>
    </div>
  );
}
