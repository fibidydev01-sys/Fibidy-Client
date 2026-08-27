'use client';

// ==========================================
// WizardNav — Fixed Bottom Navigation
// Handles 3 varian:
//
//   A. Multi-step  → ada steps + Prev/Next/Save
//   B. Save-only   → tidak ada steps, hanya Save button
//   C. Submit      → seperti A tapi last action adalah submit
//
// onBack (universal) → step 0: caller tentukan kemana (back to list,
//                      back to dashboard, back to wherever)
//
// Dipakai di: hero, contact, payment, shipping,
//             social, about, product form, register
//
// i18n: Default labels (Save/Saving/Back/Previous/Next) di-resolve dari
//       common.actions.* via useTranslations. Caller bisa override via
//       props (saveLabel, savingLabel, lastStepLabel, dst).
//
// [UI/UX — Aug 2026] Desktop bar width is HARDCODED max-w-2xl, on purpose,
// not a per-caller prop. Every caller's own content column can be whatever
// width it wants — this bar deliberately does not follow it. The one time
// it did (a contentMaxWidthClassName override for settings/hero.tsx's
// narrower max-w-lg steps), the result was every page having a
// visibly different bar width, which read as broken rather than adaptive.
// One width, everywhere, no exceptions.
//
// [UI/UX — Aug 2026 v7] Aturan di atas TETAP BERLAKU; yang berubah cuma di
// mana konstantanya tinggal. Lebarnya sekarang `PAGE_MAX_W` dari
// shared/page-column.tsx: `max-w-2xl lg:max-w-5xl`.
//
// Ini BUKAN prop per-pemanggil yang dilarang paragraf di atas. Nilainya tetap
// satu, tetap dipakai semua pemanggil, dan tetap tidak bisa ditimpa dari luar.
// Yang bergeser: halamannya kini membaca konstanta yang SAMA, jadi bar ini
// tidak lagi "sengaja tidak mengikuti" kolom kontennya — ia sejajar dengannya
// secara struktural, bukan kebetulan.
//
// Kenapa itu penting: sebelum ini settings/hero.tsx dan product/form/
// product.tsx merender formulir selebar layar sambil memasang bar 672px di
// tengah. "Satu lebar di mana-mana" terpenuhi, tapi hasilnya tetap terlihat
// rusak karena kontennya bukan lebar itu. Satu konstanta bersama menutup
// celah itu tanpa membuka pintu prop per-pemanggil.
//
// [UI/UX — Aug 2026 v2] Desktop bar switched from `fixed` (positioned
// against the viewport, with `left: var(--sidebar-width)` hand-approximating
// where the content column starts) to `sticky` (positioned as a normal
// child of whatever wraps it). `fixed` required guessing the page shell's
// padding (DashboardShell wraps every page in `container p-4 md:p-6
// lg:p-8`, and `container` itself adds `padding-inline: 2rem` — see
// globals.css) to center correctly; a wrong guess is exactly what made the
// bar visibly off-axis from the content column above it (not parallel —
// each edge shifted by a different, unmatched amount). `sticky` sidesteps
// the guessing entirely: rendered as the last child inside the SAME
// `max-w-2xl mx-auto` column every caller already wraps its own content
// in, it inherits that column's exact box, so it cannot drift from it.
//
// [UI/UX — Aug 2026 v3] Collapsed to ONE bar for every breakpoint — no
// more separate mobile block with its own (unrounded, edge-to-edge) shape.
// The only thing that changes by screen size is button LABEL TEXT
// (`hidden sm:inline`, same pattern setup-wizard-nav.tsx already used) —
// icon-only below `sm`, icon+label from `sm` up. Shape, width, and
// position are identical at every size.
//
// [UI/UX — Aug 2026 v4] Position itself now DOES split responsively:
// `fixed` below md, `sticky` from md up — verified by measuring actual
// scroll behavior, not just static screenshots. Pure `sticky` at every
// size looked stable in most positions but visibly jumped ~32px right
// at the bottom of a scrollable mobile page (MobileNavbar's mobile-only
// pb-20 reserve on SidebarInset creates a gap between where the sticky
// element's containing block ends and where it visually "should" stay
// stuck — sticky snaps back to normal flow there). `fixed` has no such
// edge case — it doesn't care about containing-block boundaries at all.
// This is safe specifically because mobile has no persistent sidebar to
// track (Sidebar switches to a Sheet/drawer below md — see
// components/ui/sidebar.tsx's useMediaQuery("(max-width: 767px)")) —
// the exact risk that made `fixed` wrong for the DESKTOP case (sidebar
// collapse changing the real content offset) doesn't exist below md.
// The mobile fixed variant hardcodes left-4/right-4 (16px) — measured
// against DashboardShell's actual rendered padding at mobile widths,
// not guessed. Also widened the bottom offset from flush-with-navbar
// (bottom-16, zero visual gap) to bottom-20 (a real ~16px floating gap),
// matching the desktop pill's own floating-with-gap look instead of
// sitting edge-to-edge against MobileNavbar.
//
// [UI/UX — Aug 2026 v5] Dropped `w-full`. On a `fixed` element with
// BOTH `left` and `right` set, `width:100%` is over-constrained against
// those offsets — the browser resolves it by effectively ignoring
// `right`, so the box was silently `100vw` wide (only visually saved by
// max-w-2xl once the viewport exceeded ~672px). Below that, on every
// phone-width viewport, the pill's right edge sat 16px past the actual
// screen edge — invisible in a static screenshot at one width, but a
// real, measured overflow, confirmed by sweeping viewport widths from
// 320 to 1600px and checking the pill's bounding box directly rather
// than eyeballing a couple of screenshots. Removing `w-full` lets
// `width:auto` do what it's supposed to for an absolutely/fixed
// positioned box with left+right both set: fill exactly the gap between
// them, still capped by max-w-2xl and centered by mx-auto once that cap
// applies. Re-swept after the fix: symmetric at every width, no overflow
// anywhere in the range.
//
// [UI/UX — Aug 2026 v6] Re-added width, but only as `md:w-full` — v5's
// sweep only checked `/dashboard/subscription` (save-only mode) and
// missed that dropping `w-full` unconditionally broke every caller's
// DESKTOP width instead: every single caller (subscription, social,
// hero, contact, about, language, password, product) wraps this in its
// own `flex flex-col` column with THIS div as a DIRECT flex-item child.
// From md up (`sticky`, `left-auto`/`right-auto`), a flex item with an
// auto cross-axis width and `mx-auto` doesn't stretch to fill its
// container even though the parent's `align-items` defaults to
// `stretch` — per the flexbox spec, auto margins in the cross axis
// absorb any leftover space FIRST, which suppresses stretch entirely
// and leaves the item sized to shrink-to-fit its own content instead.
// Confirmed by dumping computed styles directly: the pill's used width
// was 180px (shrink-to-fit around its one visible button) with
// margin-left/margin-right both computed to 246px — exactly
// (672 - 180) / 2, i.e. the max-w-2xl leftover space being silently
// eaten by the auto margins instead of the box stretching to fill it.
// `md:w-full` gives the item an explicit (non-auto) width at md+, which
// takes that leftover-space-to-auto-margins path out of the equation
// entirely — width resolves to 100% of the flex column's content box
// (which is already correctly sized/centered at max-w-2xl by that
// column's own mx-auto), margins resolve to 0, and the pill exactly
// fills its parent. Below md, `w-full` is still absent — down there the
// element is `fixed` (out of flow, not a flex item at all — flex only
// sizes in-flow children), so this is the exact same over-constraint
// case v5 already fixed and must stay untouched.
// ==========================================

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

import { ChevronLeft, ChevronRight, Crown, Save, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { StepDots } from '@/components/dashboard/shared/step-wizard';
import { cn } from '@/lib/shared/utils';
import { PAGE_MAX_W } from './page-column';

interface Step {
  title: string;
  desc?: string;
}

interface WizardNavProps {
  // Save / Submit
  onSave?: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  // Back-only bar — instant-apply sections (e.g. Language) with nothing to save
  hideSaveButton?: boolean;
  /**
   * Aksi simpannya perlu paket berbayar.
   *
   * Tombolnya TIDAK dimatikan — ia tetap terlihat dan tetap bisa ditekan,
   * cuma ikonnya berganti mahkota. Tombol mati tidak memberi tahu apa pun:
   * penjual menekannya, tidak terjadi apa-apa, dan dia tidak tahu kenapa.
   * Yang menahan aksinya ada di `onSave` pemanggil (lewat `useKasirLock`),
   * dan di sana pula modal upgrade dibuka.
   */
  saveTerkunci?: boolean;

  // Universal back — step 0: caller tentukan kemana
  onBack?: () => void;

  // Step navigation — optional, jika tidak ada → Save-only mode
  steps?: readonly Step[];
  currentStep?: number;
  onPrev?: () => void;
  onNext?: () => void;

  // Last step override — untuk kasus Review & Publish, Create store, dll
  lastStepIcon?: LucideIcon;
  lastStepLabel?: string;
  lastStepSavingLabel?: string;
  onLastStep?: () => void;   // jika undefined, fallback ke onSave
}

export function WizardNav({
  onSave,
  isSaving = false,
  saveLabel,
  savingLabel,
  hideSaveButton = false,
  saveTerkunci = false,
  onBack,
  steps,
  currentStep = 0,
  onPrev,
  onNext,
  lastStepIcon,
  lastStepLabel,
  lastStepSavingLabel,
  onLastStep,
}: WizardNavProps) {
  const t = useTranslations('common.actions');

  // i18n defaults — caller can still override via props
  const resolvedSaveLabel = saveLabel ?? t('save');
  const resolvedSavingLabel = savingLabel ?? t('saving');

  const hasSteps = steps !== undefined && steps.length > 0;
  const isLastStep = hasSteps ? currentStep === steps.length - 1 : true;
  const isFirstStep = currentStep === 0;

  const LastStepIcon = lastStepIcon ?? Save;
  const resolvedLastLabel = lastStepLabel ?? resolvedSaveLabel;
  const resolvedLastSavingLabel = lastStepSavingLabel ?? resolvedSavingLabel;
  const handleLastStep = onLastStep ?? onSave;

  // Prev button logic:
  // - step 0 + onBack → trigger onBack
  // - step 0 + no onBack → invisible
  // - step 1+ → trigger onPrev
  const handlePrev = () => {
    if (isFirstStep) {
      onBack?.();
    } else {
      onPrev?.();
    }
  };

  const showPrevButton = !isFirstStep || !!onBack;

  // ── Save-only mode (shipping, social, about) ─────────────────────────
  if (!hasSteps) {
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
        'fixed md:sticky bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-full z-40 mx-auto flex items-center justify-between gap-4 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm',
          PAGE_MAX_W,
        )}
      >
        {/* Back button (save-only mode) */}
        {onBack ? (
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-1.5 text-sm rounded-full sm:min-w-[130px]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Button>
        ) : (
          <div />
        )}

        {!hideSaveButton && (
          <Button
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 text-sm rounded-full sm:min-w-[130px]"
          >
            {saveTerkunci ? (
              <Crown className="h-3.5 w-3.5 text-amber-300" aria-hidden />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSaving ? resolvedSavingLabel : resolvedSaveLabel}
            </span>
          </Button>
        )}
      </div>
    );
  }

  // ── Multi-step mode (hero, contact, payment, product, register) ───────
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
        'fixed md:sticky bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-full z-40 mx-auto flex items-center justify-between gap-2 sm:gap-4 rounded-full border bg-background/90 px-4 sm:px-6 py-3 shadow-lg backdrop-blur-sm',
        PAGE_MAX_W,
      )}
    >
      <Button
        variant="outline"
        onClick={handlePrev}
        className={cn(
          'gap-1.5 text-sm rounded-full sm:min-w-[130px]',
          !showPrevButton && 'invisible',
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{isFirstStep ? t('back') : t('previous')}</span>
      </Button>

      <StepDots steps={steps} currentStep={currentStep} />

      {isLastStep ? (
        <Button
          onClick={handleLastStep}
          disabled={isSaving}
          className="gap-1.5 text-sm rounded-full sm:min-w-[130px]"
        >
          <LastStepIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">
            {isSaving ? resolvedLastSavingLabel : resolvedLastLabel}
          </span>
        </Button>
      ) : (
        <Button
          onClick={onNext}
          className="gap-1.5 text-sm rounded-full sm:min-w-[130px]"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
