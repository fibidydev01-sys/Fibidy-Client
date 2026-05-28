'use client';

// ============================================================================
// SUBSCRIPTION PAGE — EDU-AWARE WRAPPER
// File: src/app/[locale]/(dashboard)/dashboard/subscription/page.tsx
//
// [PHASE F · SPRINT 3 — May 2026]
// Instead of silent redirect from route guard, EDU users see
// EduRestrictedPage rendered IN PLACE of the subscription content.
//
// Flow:
//   - SELLER (non-EDU) → renders <SubscriptionPageContent />
//   - EDU SELLER       → renders <EduRestrictedPage type="subscription" />
//   - BUYER            → still hits route guard Case B (redirect to library)
//
// INTEGRATION:
// Replace the placeholder below with your existing subscription component.
// import { SubscriptionPageContent } from '@/components/dashboard/subscription/subscription-page-content';
// ============================================================================

import { useAuthStore } from '@/stores/auth-store';
import { EduRestrictedPage } from '@/components/dashboard/shared/edu-restricted-page';

// TODO: replace with your actual subscription content component import
// import { SubscriptionPageContent } from '@/components/dashboard/subscription/subscription-page-content';

export default function SubscriptionPage() {
  const tenant = useAuthStore((s) => s.tenant);

  // EDU restriction — render inline page, NOT silent redirect
  if (tenant?.isEduMode === true) {
    return <EduRestrictedPage type="subscription" />;
  }

  // Normal SELLER flow — render existing subscription content:
  // return <SubscriptionPageContent />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Subscription</h1>
      <p className="text-muted-foreground mt-2">
        [Replace with your existing SubscriptionPageContent component]
      </p>
    </div>
  );
}
