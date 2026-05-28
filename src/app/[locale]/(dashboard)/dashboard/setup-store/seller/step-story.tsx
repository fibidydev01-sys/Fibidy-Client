'use client';

// ============================================================================
// STEP STORY — Setup Wizard Step 2
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-story.tsx
//
// [SPRINT 5 — SCROLL FIX]
// Tambah data-field-error="true" ke wrapper setiap field yang error.
// Field keys: heroTitle, heroSubtitle, heroCtaText
// Placement: div wrapper langsung di atas Label + Input/Textarea.
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// [Phase B] isAutofilled prop — AutofillBadge
// ============================================================================

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { AutofillBadge } from './autofill-badge';

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
  onClearFieldError,
}: StepStoryProps) {
  const t = useTranslations('dashboard.setupStore.seller.story');

  const MAX_TITLE = 200;
  const MAX_SUBTITLE = 300;
  const MAX_CTA = 15;

  const hasHeroTitleError = fieldErrors.has('heroTitle');
  const hasHeroSubtitleError = fieldErrors.has('heroSubtitle');
  const hasHeroCtaError = fieldErrors.has('heroCtaText');

  const handleCtaChange = (value: string) => {
    if (value.length > MAX_CTA) return;
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length > 2) return;
    onHeroCtaTextChange(value);
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {/* Hero Title */}
      {/*
        [SCROLL FIX] data-field-error="true" di wrapper level space-y-1.5
        agar scroll mendarat di atas label, bukan di tengah field.
      */}
      <div
        className="space-y-1.5"
        data-field-error={hasHeroTitleError ? 'true' : undefined}
      >
        <Label
          htmlFor="wizard-heroTitle"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('heroTitleLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        <AutofillBadge visible={isAutofilled('heroTitle')} />
        <div className="relative">
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
              'h-11 text-sm pr-14 placeholder:text-muted-foreground/50',
              hasHeroTitleError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums pointer-events-none',
              heroTitle.length >= MAX_TITLE - 10
                ? 'text-amber-500 font-semibold'
                : 'text-muted-foreground/40',
            )}
          >
            {heroTitle.length}/{MAX_TITLE}
          </span>
        </div>
        {hasHeroTitleError ? (
          <p className="text-xs text-destructive font-medium">{t('heroTitleRequired')}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('heroTitleHelper')}</p>
        )}
      </div>

      {/* Hero Subtitle */}
      <div
        className="space-y-1.5"
        data-field-error={hasHeroSubtitleError ? 'true' : undefined}
      >
        <Label
          htmlFor="wizard-heroSubtitle"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('heroSubtitleLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        <AutofillBadge visible={isAutofilled('heroSubtitle')} />
        <div className="relative">
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
              'resize-none text-sm pb-5 placeholder:text-muted-foreground/50',
              hasHeroSubtitleError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          <span
            className={cn(
              'absolute bottom-2 right-3 text-[11px] font-mono tabular-nums pointer-events-none',
              heroSubtitle.length >= MAX_SUBTITLE - 20
                ? 'text-amber-500 font-semibold'
                : 'text-muted-foreground/40',
            )}
          >
            {heroSubtitle.length}/{MAX_SUBTITLE}
          </span>
        </div>
        {hasHeroSubtitleError ? (
          <p className="text-xs text-destructive font-medium">{t('heroSubtitleRequired')}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('heroSubtitleHelper')}</p>
        )}
      </div>

      {/* Hero CTA Text */}
      <div
        className="space-y-1.5"
        data-field-error={hasHeroCtaError ? 'true' : undefined}
      >
        <Label
          htmlFor="wizard-heroCtaText"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('heroCtaLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        <AutofillBadge visible={isAutofilled('heroCtaText')} />
        <div className="relative">
          <Input
            id="wizard-heroCtaText"
            placeholder={t('heroCtaPlaceholder')}
            value={heroCtaText}
            onChange={(e) => handleCtaChange(e.target.value)}
            className={cn(
              'h-11 text-sm pr-14 font-semibold placeholder:font-normal placeholder:text-muted-foreground/50',
              hasHeroCtaError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          <span
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums pointer-events-none',
              heroCtaText.length >= MAX_CTA - 2
                ? 'text-amber-500 font-semibold'
                : 'text-muted-foreground/40',
            )}
          >
            {heroCtaText.length}/{MAX_CTA}
          </span>
        </div>
        {hasHeroCtaError ? (
          <p className="text-xs text-destructive font-medium">{t('heroCtaRequired')}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('heroCtaHelper')}</p>
        )}
      </div>

    </div>
  );
}
