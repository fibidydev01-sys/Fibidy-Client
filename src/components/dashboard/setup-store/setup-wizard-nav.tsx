'use client';

// ============================================================================
// SETUP WIZARD NAV — Sprint 3 Update
// File: src/components/dashboard/setup-store/setup-wizard-nav.tsx
//
// [SPRINT 3 — S-N1 FIX: Submit button pakai OfflineAwareButton]
// Submit button sebelumnya pakai plain Button — jika user offline saat
// klik Submit, request gagal dengan network error dan user dapat generic
// toast error. Tidak jelas kenapa gagal.
//
// Fix: ganti Submit button ke OfflineAwareButton yang:
//   - Disabled otomatis saat offline (useOfflineGate hook)
//   - Tooltip menjelaskan kenapa disabled: "Anda sedang offline..."
//   - Click saat offline di-prevent (defensive guard)
//   - Saat online kembali → button aktif kembali otomatis
//
// Next button tetap plain Button — Next hanya validasi lokal, tidak
// butuh network. Offline tidak menghalangi user mengisi form.
//
// [PHASE C v2 — May 2026 carry-forward]
// REMOVED: nextDisabled prop — button tidak pernah disabled/silent.
//
// [UI/UX — Aug 2026] Restyled to match WizardNav's floating pill
// (shared/wizard-nav.tsx) — desktop was previously a flush full-width bar
// with no rounding at all and its own one-off max-w-3xl, the one visibly
// inconsistent bar against every other dashboard page's max-w-2xl pill.
// Kept as a separate component (not merged into WizardNav) — this one
// needs OfflineAwareButton + a step counter instead of dots, not worth
// the risk of reshaping the shared component for a single caller.
//
// [UI/UX — Aug 2026 v2] Desktop bar is `sticky`, not `fixed` — the caller
// (seller-setup-wizard.tsx) renders this as the last child inside its own
// `max-w-3xl mx-auto` column, one step wider than the max-w-2xl used
// everywhere else in the dashboard. Explicitly capping THIS bar at
// max-w-2xl (rather than inheriting the ancestor's max-w-3xl via plain
// w-full) keeps it the same width as every other page while still sharing
// that ancestor's center — nested mx-auto centers around the same point
// regardless of which one is narrower. See wizard-nav.tsx's header for why
// `sticky` replaced `fixed` here (same reasoning, same bug).
//
// [UI/UX — Aug 2026 v3] One bar for every breakpoint, matching
// wizard-nav.tsx's v3 — no separate unrounded mobile block. Only the
// button label text is responsive (hidden sm:inline).
// ============================================================================

import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { OfflineAwareButton } from '@/components/dashboard/shared/offline-aware-button';
import { cn } from '@/lib/shared/utils';

interface SetupWizardNavProps {
  currentStep: number;  // 0-indexed
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSaving?: boolean;
}

export function SetupWizardNav({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  isSaving = false,
}: SetupWizardNavProps) {
  const t = useTranslations('dashboard.setupStore.seller');
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const prevButton = (
    <Button
      variant="outline"
      onClick={onPrev}
      className={cn('gap-1.5 rounded-full sm:min-w-[130px]', isFirstStep && 'invisible')}
      disabled={isFirstStep}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Sebelumnya</span>
    </Button>
  );

  const stepCounter = (
    <p className="text-xs text-muted-foreground tabular-nums">
      {currentStep + 1} / {totalSteps}
    </p>
  );

  // [S-N1 FIX] Submit pakai OfflineAwareButton — disabled + tooltip saat offline
  // Next tetap plain Button — tidak butuh network untuk validasi lokal
  const nextOrSubmitButton = isLastStep ? (
    <OfflineAwareButton
      onClick={onSubmit}
      disabled={isSaving}
      offlineMessage={t('errors.offlineSubmit')}
      tooltipSide="top"
      className="gap-1.5 rounded-full sm:min-w-[130px]"
    >
      <Rocket className="h-4 w-4" />
      <span className="hidden sm:inline">
        {isSaving ? t('cta.submitting') : t('cta.submit')}
      </span>
    </OfflineAwareButton>
  ) : (
    <Button onClick={onNext} className="gap-1.5 rounded-full sm:min-w-[130px]">
      <span className="hidden sm:inline">Selanjutnya</span>
      <ChevronRight className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="sticky bottom-16 md:bottom-4 z-30 mx-auto flex w-full max-w-2xl items-center justify-between gap-2 sm:gap-4 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm">
      {prevButton}
      {stepCounter}
      {nextOrSubmitButton}
    </div>
  );
}
