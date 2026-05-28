'use client';

// ============================================================================
// STEP REVIEW — Setup Wizard Step 6
// File: src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-review.tsx
//
// [RENAME — May 2026]
// f.icon → f.image (FeatureItem.icon removed, .image is the correct field)
// ============================================================================

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Edit2, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FeatureItem, SocialLinks } from '@/types/tenant';

interface StepReviewProps {
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  aboutFeatures: FeatureItem[];
  phone: string;
  address: string;
  contactMapUrl: string;
  contactTitle: string;
  contactSubtitle: string;
  socialLinks: SocialLinks;
  onEditStep: (step: number) => void;
}

function ReviewCard({
  label,
  step,
  onEdit,
  children,
}: {
  label: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2 min-w-0">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widests">
            {label}
          </p>
          {children}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(step)}
          className="shrink-0 h-7 w-7 p-0"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export function StepReview({
  logo,
  primaryColor,
  heroBackgroundImage,
  heroTitle,
  heroSubtitle,
  heroCtaText,
  aboutFeatures,
  phone,
  address,
  contactMapUrl,
  contactTitle,
  contactSubtitle,
  socialLinks,
  onEditStep,
}: StepReviewProps) {
  const t = useTranslations('dashboard.setupStore.seller.review');

  const filledSocialLinks = Object.entries(socialLinks).filter(
    ([, v]) => typeof v === 'string' && v.trim().length > 0,
  );

  return (
    <div className="space-y-3 max-w-md mx-auto">

      {/* Step 1: Visual */}
      <ReviewCard label={t('visual')} step={1} onEdit={onEditStep}>
        <div className="flex items-center gap-3">
          {logo ? (
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border shrink-0">
              <Image src={logo} alt="Logo" fill className="object-cover" sizes="40px" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted border shrink-0" />
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: primaryColor }}
              />
              <span className="text-xs font-mono text-muted-foreground">
                {primaryColor}
              </span>
            </div>
            {heroBackgroundImage && (
              <div className="relative w-20 h-10 rounded overflow-hidden border">
                <Image
                  src={heroBackgroundImage}
                  alt="Hero bg"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            )}
          </div>
        </div>
      </ReviewCard>

      {/* Step 2: Story */}
      <ReviewCard label={t('story')} step={2} onEdit={onEditStep}>
        <div className="space-y-1">
          <p className="text-sm font-semibold truncate">{heroTitle}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{heroSubtitle}</p>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {heroCtaText}
          </span>
        </div>
      </ReviewCard>

      {/* Step 3: Highlights */}
      <ReviewCard label={t('highlights')} step={3} onEdit={onEditStep}>
        <div className="space-y-1.5">
          {aboutFeatures.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              {/* [RENAME] f.icon → f.image */}
              {f.image && (
                <div className="relative w-5 h-5 rounded overflow-hidden border shrink-0 mt-0.5">
                  <Image src={f.image} alt={f.title} fill className="object-cover" sizes="20px" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{f.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{f.description}</p>
              </div>
              <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
            </div>
          ))}
        </div>
      </ReviewCard>

      {/* Step 4: Contact */}
      <ReviewCard label={t('contact')} step={4} onEdit={onEditStep}>
        <div className="space-y-1">
          <p className="text-sm font-semibold">{contactTitle}</p>
          <p className="text-xs text-muted-foreground">{contactSubtitle}</p>
          <div className="border-t pt-1 mt-1 space-y-0.5">
            <p className="text-xs">{phone}</p>
            <p className="text-xs text-muted-foreground truncate">{address}</p>
            {contactMapUrl && (
              <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Map URL set
              </p>
            )}
          </div>
        </div>
      </ReviewCard>

      {/* Step 5: Social */}
      <ReviewCard label={t('social')} step={5} onEdit={onEditStep}>
        <div className="space-y-1">
          {filledSocialLinks.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {filledSocialLinks.map(([platform]) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary capitalize"
                >
                  <Check className="h-2.5 w-2.5" />
                  {platform}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-destructive">{t('socialEmpty')}</p>
          )}
        </div>
      </ReviewCard>

      {/* Launch note */}
      <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-4 py-3">
        <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
          {t('launchNote')}
        </p>
      </div>

    </div>
  );
}
