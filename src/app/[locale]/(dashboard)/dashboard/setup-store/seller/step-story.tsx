'use client';

// ============================================================================
// STEP STORY — Setup Wizard Step 2
// File: .../setup-store/seller/step-story.tsx
//
// [SPRINT 5 — SCROLL FIX] data-field-error="true" di pembungkus tiap isian
// yang error. Kunci: heroTitle, heroSubtitle, heroCtaText.
// [Phase B] isAutofilled → AutofillBadge.
//
// ── [PRESISI] APA YANG BERUBAH DAN KENAPA ──────────────────────────────────
//
// Versi sebelumnya memakai PAGE_GRID_2_FORM dengan PAGE_SPAN_2 pada Tagline
// saja. Terukur di 1440px: Headline 720px, Tagline 1470px, Button Text
// 720px. Tiga isian sejenis, bertumpuk, tiga lebar berbeda — dan karena
// urutannya sempit-lebar-sempit, ketidaksamaannya justru paling menonjol.
//
// Sekarang tiap isian jadi PANEL, dan panel yang sebaris selalu sama lebar.
//
// Efek samping yang bagus: LABEL GANDA HILANG. Dulu tiap isian menumpuk
// Label + AutofillBadge + helper sendiri di dalam sel grid; sekarang
// kepala panel yang memegang ketiganya. Satu lapisan markup lebih sedikit,
// dan judulnya mustahil melenceng dari isinya.
//
// ── Penempatan: [Judul][Tombol] sebaris, [Tagline] selebar ────────────────
// Judul dan teks tombol sama-sama satu baris — tingginya sama, jadi
// barisnya rata. Tagline sebuah textarea; lebar penuh memang bentuk
// alaminya.
//
// Konsekuensi yang disadari: urutan Tab jadi Judul → Tombol → Tagline,
// bukan urutan baca hero. Diterima karena formulirnya cuma tiga isian dan
// tiap panel berjudul jelas — sementara alternatifnya (tiga panel selebar
// halaman, bertumpuk) menghasilkan tiga isian selebar 1856px, yang justru
// masalah yang dokumen page-column.tsx minta dipecah jadi kolom.
// ============================================================================

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CharCounter } from '@/components/dashboard/shared/form-field';
import { TENANT_LIMITS } from '@/lib/constants/dashboard/field-limits';
import { cn } from '@/lib/shared/utils';
import { AutofillBadge } from './autofill-badge';
import { FormSection, FormPanel } from '@/components/dashboard/shared/form-panel';

interface StepStoryProps {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  onHeroTitleChange: (v: string) => void;
  onHeroSubtitleChange: (v: string) => void;
  onHeroCtaTextChange: (v: string) => void;
  isAutofilled: (field: string) => boolean;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

export function StepStory({
  heroTitle,
  heroSubtitle,
  heroCtaText,
  onHeroTitleChange,
  onHeroSubtitleChange,
  onHeroCtaTextChange,
  isAutofilled,
  fieldErrors = new Set(),
}: StepStoryProps) {
  const t = useTranslations('dashboard.setupStore.seller.story');

  // Angkanya datang dari FIELD_LIMITS — cermin DTO umkm-server. Sebelumnya
  // ditulis di sini, dan salinan kedua yang menulis medan yang SAMA hidup di
  // settings/form/hero/. Dua salinan yang harus disamakan dengan tangan
  // setiap kali servernya berubah.
  const MAX_TITLE = TENANT_LIMITS.heroTitle.max;
  const MAX_SUBTITLE = TENANT_LIMITS.heroSubtitle.max;
  const MAX_CTA = TENANT_LIMITS.heroCtaText.max;

  const hasHeroTitleError = fieldErrors.has('heroTitle');
  const hasHeroSubtitleError = fieldErrors.has('heroSubtitle');
  const hasHeroCtaError = fieldErrors.has('heroCtaText');

  const handleCtaChange = (value: string) => {
    if (value.length > MAX_CTA) return;
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length > 2) return;
    onHeroCtaTextChange(value);
  };

  // Helper ATAU pesan error — bukan keduanya. Ditulis sekali di sini supaya
  // ketiga panel memperlakukannya sama persis.
  const jelaskan = (error: boolean, errorKey: string, helperKey: string) =>
    error ? (
      <span className="font-medium text-destructive">{t(errorKey)}</span>
    ) : (
      t(helperKey)
    );

  return (
    <FormSection>
      {/* ── Judul hero ───────────────────────────────────────────────────── */}
      <FormPanel
        title={t('heroTitleLabel')}
        required
        badge={<AutofillBadge visible={isAutofilled('heroTitle')} />}
        description={jelaskan(
          hasHeroTitleError,
          'heroTitleRequired',
          'heroTitleHelper',
        )}
      >
        <div
          className="relative"
          data-field-error={hasHeroTitleError ? 'true' : undefined}
        >
          <Input
            id="wizard-heroTitle"
            placeholder={t('heroTitlePlaceholder')}
            value={heroTitle}
            onChange={(e) => {
              if (e.target.value.length <= MAX_TITLE) {
                onHeroTitleChange(e.target.value);
              }
            }}
            className={cn(
              'pr-16',
              hasHeroTitleError &&
                'border-destructive focus-visible:ring-destructive',
            )}
          />
          <CharCounter
            current={heroTitle.length}
            max={MAX_TITLE}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </FormPanel>

      {/* ── Teks tombol ──────────────────────────────────────────────────── */}
      <FormPanel
        title={t('heroCtaLabel')}
        required
        badge={<AutofillBadge visible={isAutofilled('heroCtaText')} />}
        description={jelaskan(
          hasHeroCtaError,
          'heroCtaRequired',
          'heroCtaHelper',
        )}
      >
        <div
          className="relative"
          data-field-error={hasHeroCtaError ? 'true' : undefined}
        >
          <Input
            id="wizard-heroCtaText"
            placeholder={t('heroCtaPlaceholder')}
            value={heroCtaText}
            onChange={(e) => handleCtaChange(e.target.value)}
            className={cn(
              'pr-16',
              hasHeroCtaError &&
                'border-destructive focus-visible:ring-destructive',
            )}
          />
          <CharCounter
            current={heroCtaText.length}
            max={MAX_CTA}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </FormPanel>

      {/* ── Tagline ──────────────────────────────────────────────────────── */}
      <FormPanel
        title={t('heroSubtitleLabel')}
        required
        wide
        badge={<AutofillBadge visible={isAutofilled('heroSubtitle')} />}
        description={jelaskan(
          hasHeroSubtitleError,
          'heroSubtitleRequired',
          'heroSubtitleHelper',
        )}
      >
        <div
          className="relative"
          data-field-error={hasHeroSubtitleError ? 'true' : undefined}
        >
          <Textarea
            id="wizard-heroSubtitle"
            placeholder={t('heroSubtitlePlaceholder')}
            value={heroSubtitle}
            onChange={(e) => {
              if (e.target.value.length <= MAX_SUBTITLE) {
                onHeroSubtitleChange(e.target.value);
              }
            }}
            rows={3}
            className={cn(
              'resize-none pb-6',
              hasHeroSubtitleError &&
                'border-destructive focus-visible:ring-destructive',
            )}
          />
          <CharCounter
            current={heroSubtitle.length}
            max={MAX_SUBTITLE}
            className="absolute bottom-2 right-3"
          />
        </div>
      </FormPanel>
    </FormSection>
  );
}
