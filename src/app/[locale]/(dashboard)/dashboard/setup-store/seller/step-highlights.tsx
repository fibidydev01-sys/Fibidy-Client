'use client';

// ============================================================================
// STEP HIGHLIGHTS — Setup Wizard Step 3
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-highlights.tsx
//
// [PHASE C FIX]
// Props normalized:
//   items  (was: features in wizard, items in component — now unified as items)
//   onChange (FeatureItem[])
//   isAutofilled (field: string) => boolean
//
// Seller picks 3 highlights (icon URL + title + description).
// ============================================================================

import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AutofillBadge } from './autofill-badge';
import type { FeatureItem } from '@/types/tenant';

interface StepHighlightsProps {
  items: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
  isAutofilled: (field: string) => boolean;
}

const EMPTY_FEATURE: FeatureItem = { icon: '', title: '', description: '' };

export function StepHighlights({
  items,
  onChange,
  isAutofilled,
}: StepHighlightsProps) {
  const t = useTranslations('dashboard.setupStore.seller.highlights');

  // Ensure always 3 slots
  const features: FeatureItem[] = [
    items[0] ?? { ...EMPTY_FEATURE },
    items[1] ?? { ...EMPTY_FEATURE },
    items[2] ?? { ...EMPTY_FEATURE },
  ];

  const updateFeature = (index: number, patch: Partial<FeatureItem>) => {
    const next = features.map((f, i) => (i === index ? { ...f, ...patch } : f));
    onChange(next);
  };

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>

      <AutofillBadge visible={isAutofilled('aboutFeatures')} />

      {features.map((feature, i) => (
        <div key={i} className="space-y-4 border rounded-xl p-4">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            {t('iconLabel', { index: i + 1 })}
          </p>

          {/* Icon URL */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              Icon URL <span className="text-destructive normal-case font-normal">*</span>
            </Label>
            <Input
              type="url"
              placeholder="https://cdn.example.com/icon.svg"
              value={feature.icon ?? ''}
              onChange={(e) => updateFeature(i, { icon: e.target.value })}
              className="h-10 text-sm"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
              Title <span className="text-destructive normal-case font-normal">*</span>
            </Label>
            <Input
              placeholder={t('titlePlaceholder')}
              value={feature.title}
              onChange={(e) => updateFeature(i, { title: e.target.value })}
              maxLength={15}
              className="h-10 text-sm font-semibold"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
              Description <span className="text-destructive normal-case font-normal">*</span>
            </Label>
            <Textarea
              placeholder={t('descriptionPlaceholder')}
              value={feature.description ?? ''}
              onChange={(e) => updateFeature(i, { description: e.target.value })}
              maxLength={100}
              rows={2}
              className="resize-none text-sm"
            />
            <p className="text-[11px] text-muted-foreground text-right tabular-nums">
              {(feature.description ?? '').length}/100
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
