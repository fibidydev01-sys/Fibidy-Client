'use client';

// ============================================================================
// STEP HIGHLIGHTS — Setup Wizard Step 3
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-highlights.tsx
//
// Fields: aboutFeatures[0..2] — exactly 3, each with icon, title (2-15), description (10-100)
//
// [Phase B] isAutofilled prop added — renders AutofillBadge in the intro area.
// The badge represents the entire aboutFeatures array (treated as one unit).
// Once the seller removes or uploads any icon (triggering onFeaturesChange),
// the wizard's set('aboutFeatures', ...) call removes it from autofilledFields.
// ============================================================================

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { FilledSlot, EmptySlot } from '@/components/dashboard/shared/image-slot';
import { AutofillBadge } from './autofill-badge';
import type { FeatureItem } from '@/types/tenant';

// ─── Constants ───────────────────────────────────────────────────────────────

const REQUIRED_SLOTS = 3;
const MAX_TITLE = 15;
const MAX_DESC = 100;

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepHighlightsProps {
  aboutFeatures: FeatureItem[];
  onFeaturesChange: (features: FeatureItem[]) => void;
  /** Phase B — called with field name; returns true if still holding autofill value */
  isAutofilled: (field: string) => boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepHighlights({
  aboutFeatures,
  onFeaturesChange,
  isAutofilled,
}: StepHighlightsProps) {
  const t = useTranslations('dashboard.setupStore.seller.highlights');
  const itemsRef = useRef<FeatureItem[]>([]);

  useEffect(() => {
    itemsRef.current = aboutFeatures;
  }, [aboutFeatures]);

  const { isUploading, openWidget } = useCloudinaryUpload({
    folder: 'fibidy/feature-icons',
    maxFiles: 1,
    multiple: false,
    onSuccess: (url) => {
      const cur = itemsRef.current;
      if (cur.length >= REQUIRED_SLOTS) return;
      const newItem: FeatureItem = { icon: url, title: '', description: '' };
      onFeaturesChange([...cur, newItem]);
    },
  });

  const handleOpen = () => {
    if (aboutFeatures.length >= REQUIRED_SLOTS) return;
    openWidget(1);
  };

  const handleRemove = (index: number) => {
    onFeaturesChange(aboutFeatures.filter((_, i) => i !== index));
  };

  const handleUpdate = (
    index: number,
    field: keyof FeatureItem,
    val: string,
  ) => {
    const updated = [...aboutFeatures];
    updated[index] = { ...updated[index], [field]: val };
    onFeaturesChange(updated);
  };

  const handleTitleChange = (index: number, val: string) => {
    if (val.length > MAX_TITLE) return;
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (words.length > 2) return;
    handleUpdate(index, 'title', val);
  };

  return (
    <div className="space-y-2 max-w-sm mx-auto">

      {/* Intro + Phase B badge */}
      <div className="space-y-1.5 text-center pb-2">
        <p className="text-sm text-muted-foreground">
          {t('intro')}
        </p>
        {/* Phase B badge — one badge for the whole highlights section */}
        <AutofillBadge visible={isAutofilled('aboutFeatures')} />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-1.5 pb-4">
        {Array.from({ length: REQUIRED_SLOTS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i < aboutFeatures.length
                ? 'w-8 bg-primary'
                : 'w-4 bg-border',
            )}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-2 tabular-nums">
          {aboutFeatures.length}/{REQUIRED_SLOTS}
        </span>
      </div>

      {/* Slots */}
      {Array.from({ length: REQUIRED_SLOTS }).map((_, i) => {
        const item = aboutFeatures[i];

        if (item) {
          return (
            <FilledSlot
              key={i}
              url={item.icon || ''}
              index={i}
              onRemove={() => handleRemove(i)}
            >
              {/* Title */}
              <div className="relative">
                <Input
                  placeholder={t('titlePlaceholder')}
                  value={item.title || ''}
                  onChange={(e) => handleTitleChange(i, e.target.value)}
                  className="h-9 text-sm font-semibold pr-12 placeholder:font-normal placeholder:text-muted-foreground/50"
                />
                <span
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums pointer-events-none',
                    (item.title || '').length >= MAX_TITLE - 2
                      ? 'text-amber-500 font-semibold'
                      : 'text-muted-foreground/40',
                  )}
                >
                  {(item.title || '').length}/{MAX_TITLE}
                </span>
              </div>

              {/* Description */}
              <div className="relative">
                <Textarea
                  placeholder={t('descriptionPlaceholder')}
                  value={item.description || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESC) {
                      handleUpdate(i, 'description', e.target.value);
                    }
                  }}
                  rows={3}
                  className="resize-none text-sm pb-5 placeholder:font-normal placeholder:text-muted-foreground/50"
                />
                <span
                  className={cn(
                    'absolute bottom-2 right-3 text-[10px] font-mono tabular-nums pointer-events-none',
                    (item.description || '').length >= MAX_DESC - 10
                      ? 'text-amber-500 font-semibold'
                      : 'text-muted-foreground/40',
                  )}
                >
                  {(item.description || '').length}/{MAX_DESC}
                </span>
              </div>
            </FilledSlot>
          );
        }

        return (
          <EmptySlot
            key={`empty-${i}`}
            index={i}
            label={t('iconLabel', { index: i + 1 })}
            onClick={handleOpen}
            isLoading={isUploading && i === aboutFeatures.length}
          >
            <div className="h-9 rounded-md bg-muted/40 border border-dashed" />
            <div className="h-[76px] rounded-md bg-muted/40 border border-dashed" />
          </EmptySlot>
        );
      })}

    </div>
  );
}
