'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ContactFormData } from '@/types/tenant';

interface StepSectionHeadingProps {
  formData: ContactFormData;
  updateFormData: <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => void;
  isDesktop?: boolean;
}

export function StepSectionHeading({ formData, updateFormData, isDesktop = false }: StepSectionHeadingProps) {

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  if (isDesktop) {
    return (
      <div className="space-y-8 max-w-lg mx-auto">

        {/* Section Title */}
        <div id="tour-contact-title" className="space-y-1.5">
          <Label htmlFor="contactTitle-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Section Title
          </Label>
          <Input
            id="contactTitle-d"
            placeholder="Contact Us"
            value={formData.contactTitle}
            onChange={(e) => updateFormData('contactTitle', e.target.value)}
            className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground">Main heading shown in your Contact section</p>
        </div>

        {/* Section Subheading */}
        <div className="space-y-1.5">
          <Label htmlFor="contactSubtitle-d" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Section Subheading
          </Label>
          <Input
            id="contactSubtitle-d"
            placeholder="We're here to help"
            value={formData.contactSubtitle}
            onChange={(e) => updateFormData('contactSubtitle', e.target.value)}
            className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
          />
          <p className="text-xs text-muted-foreground">Supporting line shown below the title</p>
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
          Section Title
        </Label>
        <Input
          id="contactTitle-m"
          placeholder="Contact Us"
          value={formData.contactTitle}
          onChange={(e) => updateFormData('contactTitle', e.target.value)}
          className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">Main heading shown in your Contact section</p>
      </div>

      {/* Section Subheading */}
      <div className="space-y-1.5">
        <Label htmlFor="contactSubtitle-m" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Section Subheading
        </Label>
        <Input
          id="contactSubtitle-m"
          placeholder="We're here to help"
          value={formData.contactSubtitle}
          onChange={(e) => updateFormData('contactSubtitle', e.target.value)}
          className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <p className="text-xs text-muted-foreground">Supporting line shown below the title</p>
      </div>

    </div>
  );
}