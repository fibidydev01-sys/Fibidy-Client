'use client';

// ============================================================================
// SETUP STORE CLIENT — Dispatcher
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/client.tsx
//
// [SETUP-GATE Phase A — May 2026]
// Updated dispatcher to import SellerSetupWizard from new seller/ directory.
// BuyerUpgradeWizard remains UNCHANGED — paste it back in from the old client.tsx.
//
// MIGRATION NOTES:
// 1. Replace the entire file with this content.
// 2. Copy the BuyerUpgradeWizard function from the old client.tsx and paste it
//    back in (below the SetupStoreClient export). The BuyerUpgradeWizard logic
//    is unchanged — only the SellerSetupWizard moved to its own file.
// ============================================================================

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { SellerSetupWizard } from './seller/seller-setup-wizard';

// ── BuyerUpgradeWizard ────────────────────────────────────────────────────────
// PASTE THE EXISTING BuyerUpgradeWizard COMPONENT HERE (unchanged from old client.tsx)
// It handles: Category → Store Info → WhatsApp → Review → upgrade-to-seller
// ─────────────────────────────────────────────────────────────────────────────

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function SetupStoreClient() {
  const tenant = useAuthStore((s) => s.tenant);
  const router = useRouter();

  // Auth not yet checked — render nothing (layout handles loading state)
  if (!tenant) return null;

  // SELLER + already complete → route guard handles this, but safe fallback
  if (tenant.role === 'SELLER' && tenant.isSetupComplete) {
    router.replace('/dashboard/studio');
    return null;
  }

  // SELLER + setup not complete → NEW 6-step wizard (Phase A)
  if (tenant.role === 'SELLER' && !tenant.isSetupComplete) {
    return <SellerSetupWizard />;
  }

  // BUYER → upgrade to seller wizard (unchanged)
  return <BuyerUpgradeWizard />;
}

// ── PLACEHOLDER — replace with actual BuyerUpgradeWizard from old client.tsx ──
function BuyerUpgradeWizard() {
  // PASTE EXISTING BuyerUpgradeWizard HERE
  return null;
}
