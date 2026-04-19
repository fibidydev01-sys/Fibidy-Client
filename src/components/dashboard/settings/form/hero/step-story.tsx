'use client';

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { HeroFormData } from '@/types/tenant';

interface StepStoryProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
}

const FIELDS: Array<{
  key: 'heroTitle' | 'heroSubtitle' | 'description';
  labelKey: 'headlineLabel' | 'subheadingLabel' | 'taglineLabel';
  placeholderKey: 'headlinePlaceholder' | 'subheadingPlaceholder' | 'taglinePlaceholder';
}> = [
    { key: 'heroTitle', labelKey: 'headlineLabel', placeholderKey: 'headlinePlaceholder' },
    { key: 'heroSubtitle', labelKey: 'subheadingLabel', placeholderKey: 'subheadingPlaceholder' },
    { key: 'description', labelKey: 'taglineLabel', placeholderKey: 'taglinePlaceholder' },
  ];

export function StepStory({ formData, updateFormData }: StepStoryProps) {
  const t = useTranslations('settings.hero.story');

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {FIELDS.map((field) => (
        <div key={field.key} id={`tour-${field.key}`} className="space-y-1.5">
          <Label
            htmlFor={field.key}
            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
          >
            {t(field.labelKey)}
          </Label>
          <Textarea
            id={field.key}
            placeholder={t(field.placeholderKey)}
            value={formData[field.key] as string}
            onChange={(e) => updateFormData(field.key, e.target.value)}
            className="resize-none text-sm font-medium leading-relaxed placeholder:font-normal placeholder:text-muted-foreground/50"
            rows={3}
          />
        </div>
      ))}
    </div>
  );
}