'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import type { HeroFormData } from '@/types/tenant';

interface StepIdentityProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
  tenantEmail?: string;
  tenantSlug?: string;
  onCtaTextChange: (value: string) => void;
}

export function StepIdentity({
  formData,
  updateFormData,
  tenantEmail = '',
  tenantSlug = '',
  onCtaTextChange,
}: StepIdentityProps) {
  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {/* Store Name */}
      <div id="tour-store-name" className="space-y-1.5">
        <Label htmlFor="name" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Store Name
        </Label>
        <Input
          id="name"
          placeholder="e.g. Burger House"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          className="h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Button Label */}
      <div id="tour-cta-button-label" className="space-y-1.5">
        <Label htmlFor="cta" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
          Button Label
        </Label>
        <div className="relative">
          <Input
            id="cta"
            placeholder="Order Now"
            value={formData.heroCtaText}
            onChange={(e) => onCtaTextChange(e.target.value)}
            className="h-11 text-sm font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50 pr-12"
            maxLength={15}
          />
          <span className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono tabular-nums pointer-events-none',
            formData.heroCtaText.length >= 14 ? 'text-amber-500 font-semibold' : 'text-muted-foreground/50'
          )}>
            {formData.heroCtaText.length}/15
          </span>
        </div>
      </div>

      {/* Category */}
      <div id="tour-category" className="space-y-1.5">
        <Label htmlFor="category" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
          Category
          <Lock className="h-3 w-3 text-muted-foreground/50" />
        </Label>
        <Input
          id="category"
          value={formData.category || 'Not set'}
          disabled
          className="h-11 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="tenantEmail" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
          Email
          <Lock className="h-3 w-3 text-muted-foreground/50" />
        </Label>
        <Input
          id="tenantEmail"
          value={tenantEmail}
          disabled
          className="h-11 text-sm bg-muted/30 text-muted-foreground cursor-not-allowed"
        />
      </div>

      {/* Store Domain */}
      <div className="space-y-1.5">
        <Label htmlFor="tenantDomain" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground flex items-center gap-1.5">
          Store Domain
          <Lock className="h-3 w-3 text-muted-foreground/50" />
        </Label>
        <Input
          id="tenantDomain"
          value={`${tenantSlug}.fibidy.com`}
          disabled
          className="h-11 text-sm font-mono bg-muted/30 text-muted-foreground cursor-not-allowed"
        />
      </div>

    </div>
  );
}