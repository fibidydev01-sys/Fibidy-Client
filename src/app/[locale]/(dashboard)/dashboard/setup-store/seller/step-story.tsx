'use client';

// ============================================================================
// STEP STORY — Setup Wizard Step 2
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-story.tsx
//
// Fields: heroTitle (5-200), heroSubtitle (10-300), heroCtaText (2-15 chars, max 2 words)
//
// [Phase B] isAutofilled prop added — renders AutofillBadge under label
// for heroTitle, heroSubtitle, heroCtaText (all 3 are autofillable).
// ============================================================================

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { AutofillBadge } from './autofill-badge';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepStoryProps {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  onHeroTitleChange: (v: string) => void;
  onHeroSubtitleChange: (v: string) => void;
  onHeroCtaTextChange: (v: string) => void;
  /** Phase B — called with field name; returns true if still holding autofill value */
  isAutofilled: (field: string) => boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepStory({
  heroTitle,
  heroSubtitle,
  heroCtaText,
  onHeroTitleChange,
  onHeroSubtitleChange,
  onHeroCtaTextChange,
  isAutofilled,
}: StepStoryProps) {
  const t = useTranslations('dashboard.setupStore.seller.story');

  const MAX_TITLE = 200;
  const MAX_SUBTITLE = 300;
  const MAX_CTA = 15;

  const handleCtaChange = (value: string) => {
    if (value.length > MAX_CTA) return;
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length > 2) return;
    onHeroCtaTextChange(value);
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {/* Hero Title */}
      <div className="space-y-1.5">
        <Label
          htmlFor="wizard-heroTitle"
          className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
        >
          {t('heroTitleLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        {/* Phase B badge */}
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
            className="h-11 text-sm pr-14 placeholder:text-muted-foreground/50"
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
        <p className="text-xs text-muted-foreground">{t('heroTitleHelper')}</p>
      </div>

      {/* Hero Subtitle */}
      <div className="space-y-1.5">
        <Label
          htmlFor="wizard-heroSubtitle"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('heroSubtitleLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        {/* Phase B badge */}
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
            className="resize-none text-sm pb-5 placeholder:text-muted-foreground/50"
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
        <p className="text-xs text-muted-foreground">{t('heroSubtitleHelper')}</p>
      </div>

      {/* Hero CTA Text */}
      <div className="space-y-1.5">
        <Label
          htmlFor="wizard-heroCtaText"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('heroCtaLabel')}{' '}
          <span className="text-destructive normal-case font-normal">*</span>
        </Label>
        {/* Phase B badge */}
        <AutofillBadge visible={isAutofilled('heroCtaText')} />
        <div className="relative">
          <Input
            id="wizard-heroCtaText"
            placeholder={t('heroCtaPlaceholder')}
            value={heroCtaText}
            onChange={(e) => handleCtaChange(e.target.value)}
            className="h-11 text-sm pr-14 font-semibold placeholder:font-normal placeholder:text-muted-foreground/50"
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
        <p className="text-xs text-muted-foreground">{t('heroCtaHelper')}</p>
      </div>

    </div>
  );
}
