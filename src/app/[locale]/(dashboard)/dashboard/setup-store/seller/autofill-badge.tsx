'use client';

// ============================================================================
// AUTOFILL BADGE — Phase B
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/autofill-badge.tsx
//
// [SETUP-GATE Phase B — May 2026]
// Shown next to fields that were pre-filled by the autofill system.
// Disappears automatically when the seller edits the field (parent removes
// the field from autofilledFields Set → visible prop becomes false).
//
// Usage:
//   <AutofillBadge visible={isAutofilled('heroTitle')} />
// ============================================================================

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AutofillBadgeProps {
  /**
   * When true the badge renders. When false the component returns null.
   * Parent controls this via autofilledFields Set membership.
   */
  visible: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AutofillBadge({ visible }: AutofillBadgeProps) {
  const t = useTranslations('dashboard.setupStore.seller');

  if (!visible) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 select-none">
      <Sparkles className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
      {t('autofillBadge')}
    </span>
  );
}
