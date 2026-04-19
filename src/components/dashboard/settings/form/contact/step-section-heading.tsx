'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ContactFormData } from '@/types/tenant';

interface StepSectionHeadingProps {
  formData: ContactFormData;
  updateFormData: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  isDesktop?: boolean;
}

export function StepSectionHeading({ formData, updateFormData, isDesktop = false }: StepSectionHeadingProps) {
  const t = useTranslations('settings.contact.heading');

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-8 max-w-lg mx-auto">

        {/* Section Title */}
        <div id="tour-contact-title" className="space-y-1.5">
          <Label htmlFor="contactTitle-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('titleLabel')}
          </Label>
          <Input
            id="contactTitle-d"
            placeholder={t('titlePlaceholder')}
            value={formData.contactTitle}
            onChange={(e) => updateFormData('contactTitle', e.target.value)}
            className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground">{t('titleHelper')}</p>
        </div>

        {/* Section Subheading */}
        <div className="space-y-1.5">
          <Label htmlFor="contactSubtitle-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('subheadingLabel')}
          </Label>
          <Input
            id="contactSubtitle-d"
            placeholder={t('subheadingPlaceholder')}
            value={formData.contactSubtitle}
            onChange={(e) => updateFormData('contactSubtitle', e.target.value)}
            className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground">{t('subheadingHelper')}</p>
        </div>

      </div>
    );
  }

  // ── MOBILE ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-sm mx-auto">

      {/* Section Title */}
      <div id="tour-contact-title" className="space-y-1.5">
        <Label htmlFor="contactTitle-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          {t('titleLabel')}
        </Label>
        <Input
          id="contactTitle-m"
          placeholder={t('titlePlaceholder')}
          value={formData.contactTitle}
          onChange={(e) => updateFormData('contactTitle', e.target.value)}
          className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">{t('titleHelper')}</p>
      </div>

      {/* Section Subheading */}
      <div className="space-y-1.5">
        <Label htmlFor="contactSubtitle-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          {t('subheadingLabel')}
        </Label>
        <Input
          id="contactSubtitle-m"
          placeholder={t('subheadingPlaceholder')}
          value={formData.contactSubtitle}
          onChange={(e) => updateFormData('contactSubtitle', e.target.value)}
          className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">{t('subheadingHelper')}</p>
      </div>

    </div>
  );
}