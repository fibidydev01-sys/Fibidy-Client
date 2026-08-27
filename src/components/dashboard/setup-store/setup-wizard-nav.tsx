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
//
// [UI/UX — Aug 2026 v4] fixed below md, sticky from md up — matching
// wizard-nav.tsx's v4. setup-store hides MobileNavbar entirely (see
// dashboard-layout.tsx's isSetupStore check) so this specific caller
// never actually had the sticky-detach-near-full-scroll bug that
// motivated the split there, but using the same mechanism everywhere
// is the point — one component, one behavior, no per-caller exceptions.
//
// [UI/UX — Aug 2026 v5] Dropped `w-full` — see wizard-nav.tsx's v5 note.
// Same over-constrained-width bug (right edge silently ignored, pill
// 16px wider than the screen on every phone-width viewport below
// max-w-2xl) applied here identically.
//
// [UI/UX — Aug 2026 v6] Re-added as `md:w-full` — see wizard-nav.tsx's
// v6 note for the full writeup. This specific caller (seller-setup-
// wizard.tsx's `max-w-3xl mx-auto pb-40 md:pb-8`) isn't itself a `flex
// flex-col` — this component wasn't actually hitting the shrink-to-fit
// bug v6 fixes elsewhere — but `md:w-full` is a no-op for a plain block
// parent (width:100% and width:auto resolve to the exact same used
// value once max-w-2xl and centered auto margins are applied either
// way) so there's no reason for this component's className to diverge
// from the other two just because its current caller happens not to
// trigger the bug. One shared shape, verified safe either way.
// ============================================================================

// ── BENTUK: PIL, MENGIKUTI DIALEK DASBOR ──────────────────────────────────
//
// Bilah ini dan kedua tombolnya `rounded-full`. Sempat dilepas ke 12px/8px
// atas dasar expo.design.md ("pill geometry is reserved for badges only"),
// lalu DIKEMBALIKAN: pemilik produk menolak bentuk kotak itu setelah
// melihatnya di layar. Lihat catatan panjangnya di globals.css, blok
// [data-surface="app"] — dialek dasbor memang pil, dan itu pilihan, bukan
// kelalaian.
//
// Tinggi tombolnya TIDAK dikembalikan ke h-9: 40px adalah ukuran baku
// Button sekarang, dan tidak ada yang mempermasalahkannya.

import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { OfflineAwareButton } from '@/components/dashboard/shared/offline-aware-button';
import { cn } from '@/lib/shared/utils';
import { PAGE_MAX_W } from '@/components/dashboard/shared/page-column';

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
    <div
      className={cn(
      // [PRESISI] `mt-6` — jarak antara isi dan pill.
      //
      // Terukur sebelumnya: tepi bawah panel terakhir dan tepi atas pill
      // sama-sama di y=710. Nol piksel. Tidak bertumpuk, tapi menempel.
      //
      // `pb-*` di kerangka halaman TIDAK bisa menghasilkan jarak ini — ia
      // menambah ruang DI BAWAH pill (anak terakhir), bukan di antara
      // keduanya. Yang dibutuhkan margin pada pill-nya sendiri.
      //
      // Di bawah md pill-nya `fixed` sehingga margin tidak berlaku, dan
      // memang tidak perlu: di sana ia melayang dengan bottom-20.
      'mt-6 ' +
        'fixed md:sticky bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-full z-30 mx-auto flex items-center justify-between gap-2 sm:gap-4 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm',
        PAGE_MAX_W,
      )}
    >
      {prevButton}
      {stepCounter}
      {nextOrSubmitButton}
    </div>
  );
}
