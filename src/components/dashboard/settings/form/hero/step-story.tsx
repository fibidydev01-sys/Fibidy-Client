'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { HeroFormData } from '@/types/tenant';

interface StepStoryProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
}

const FIELDS = [
  {
    key: 'heroTitle' as const,
    label: 'Headline',
    placeholder: 'Write your main store headline...',
  },
  {
    key: 'heroSubtitle' as const,
    label: 'Subheading',
    placeholder: "One sentence capturing your store's main value...",
  },
  {
    key: 'description' as const,
    label: 'Store Tagline',
    placeholder: "Your store's unique tagline...",
  },
] as const;

export function StepStory({ formData, updateFormData }: StepStoryProps) {
  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {FIELDS.map((field) => (
        <div key={field.key} id={`tour-${field.key}`} className="space-y-1.5">
          <Label
            htmlFor={field.key}
            className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
          >
            {field.label}
          </Label>
          <Textarea
            id={field.key}
            placeholder={field.placeholder}
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