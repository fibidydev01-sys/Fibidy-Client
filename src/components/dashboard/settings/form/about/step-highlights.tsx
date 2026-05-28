'use client';

// ============================================================================
// STEP HIGHLIGHTS — Settings About Form
// File: src/components/dashboard/settings/form/about/step-highlights.tsx
//
// [BACKPORT — 2026-05-28]
// Tambah prop onUploadStateChange(slotId, active) agar parent (AboutSection)
// bisa track upload in-progress dan guard save button.
// Pattern identik dengan StepHighlights di Setup wizard (G1 fix).
//
// [FIX — May 2026]
// image-slot.tsx no longer exports FilledSlot or LockedSlot.
//
// [RENAME — May 2026]
// item.icon → item.image (FeatureItem.icon removed)
// ============================================================================

import { useEffect, useRef, useCallback } from 'react';
import { Crown, Lock, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { EmptySlot } from '@/components/dashboard/shared/image-slot';
import type { AboutFormData, FeatureItem } from '@/types/tenant';

// ─── Constants ────────────────────────────────────────────────────────────
const TOTAL_SLOTS = 7;
const FREE_SLOTS = 4;
const MAX_TITLE = 15;
const MAX_DESC = 100;

// ─── Props ────────────────────────────────────────────────────────────────
interface StepHighlightsProps {
  formData: AboutFormData;
  updateFormData: <K extends keyof AboutFormData>(key: K, value: AboutFormData[K]) => void;
  isBusiness?: boolean;
  onUpgrade?: () => void;
  /** [BACKPORT] Callback untuk track upload in-progress ke parent */
  onUploadStateChange?: (slotId: string, active: boolean) => void;
}

// ─── Inline LockedSlot ────────────────────────────────────────────────────
function LockedSlotInline({ onClick }: { onClick: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/10 p-4 space-y-3">
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50 text-amber-600 dark:text-amber-400 text-xs font-medium hover:bg-amber-100/60 transition-colors"
      >
        <Lock className="h-3.5 w-3.5" aria-hidden />
        <Crown className="h-3.5 w-3.5" aria-hidden />
      </button>
      <div className="h-9 rounded-md bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50" />
      <div className="h-[76px] rounded-md bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50" />
    </div>
  );
}

// ─── Highlight Card (filled) ──────────────────────────────────────────────
interface HighlightCardProps {
  item: FeatureItem;
  index: number;
  onRemove: () => void;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  t: ReturnType<typeof useTranslations<'settings.about'>>;
}

function HighlightCard({
  item,
  index,
  onRemove,
  onTitleChange,
  onDescriptionChange,
  t,
}: HighlightCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3 group">
      {/* Image thumbnail + remove button */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-lg overflow-hidden border bg-muted shrink-0">
          {item.image && (
            <Image
              src={item.image}
              alt={item.title || `Highlight ${index + 1}`}
              fill
              className="object-cover"
              sizes="48px"
              unoptimized
            />
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove highlight"
          className="ml-auto p-1.5 rounded-full bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <div className="relative">
        <Input
          placeholder={t('highlightTitlePlaceholder')}
          value={item.title || ''}
          onChange={(e) => onTitleChange(e.target.value)}
          className="h-9 text-sm font-semibold pr-10 placeholder:font-normal placeholder:text-muted-foreground/50"
        />
        <span
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums pointer-events-none',
            (item.title || '').length >= MAX_TITLE - 2
              ? 'text-amber-500 font-semibold'
              : 'text-muted-foreground/40',
          )}
        >
          {t('counter', { current: (item.title || '').length, max: MAX_TITLE })}
        </span>
      </div>

      {/* Description */}
      <div className="relative">
        <Textarea
          placeholder={t('highlightDescriptionPlaceholder')}
          value={item.description || ''}
          onChange={(e) => {
            if (e.target.value.length <= MAX_DESC) {
              onDescriptionChange(e.target.value);
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
          {t('counter', { current: (item.description || '').length, max: MAX_DESC })}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────
export function StepHighlights({
  formData,
  updateFormData,
  isBusiness = false,
  onUpgrade,
  onUploadStateChange,
}: StepHighlightsProps) {
  const t = useTranslations('settings.about');
  const itemsRef = useRef<FeatureItem[]>([]);
  const maxSlots = isBusiness ? TOTAL_SLOTS : FREE_SLOTS;
  const items = formData.aboutFeatures;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const { isUploading, openWidget } = useCloudinaryUpload({
    folder: 'fibidy/highlight-images',
    maxFiles: 1,
    onSuccess: (url) => {
      const cur = itemsRef.current;
      const newItem: FeatureItem = { image: url, title: '', description: '' };
      updateFormData('aboutFeatures', [...cur, newItem]);
    },
  });

  // [BACKPORT] Report upload state ke parent
  useEffect(() => {
    onUploadStateChange?.('highlights-new', isUploading);
  }, [isUploading, onUploadStateChange]);

  const handleOpen = () => {
    if (items.length >= maxSlots) return;
    openWidget(1);
  };

  const handleRemove = (index: number) => {
    updateFormData('aboutFeatures', items.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof FeatureItem, val: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    updateFormData('aboutFeatures', updated);
  };

  const handleTitleChange = (index: number, val: string) => {
    const words = val.trim().split(/\s+/).filter(Boolean);
    if (val.length > MAX_TITLE) return;
    if (words.length > 2) return;
    handleUpdate(index, 'title', val);
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {Array.from({ length: maxSlots }).map((_, i) => {
        const item = items[i];

        if (item) {
          return (
            <HighlightCard
              key={i}
              item={item}
              index={i}
              onRemove={() => handleRemove(i)}
              onTitleChange={(val) => handleTitleChange(i, val)}
              onDescriptionChange={(val) => handleUpdate(i, 'description', val)}
              t={t}
            />
          );
        }

        if (!isBusiness && i >= FREE_SLOTS) {
          return (
            <LockedSlotInline key={`locked-${i}`} onClick={() => onUpgrade?.()} />
          );
        }

        return (
          <div key={`empty-wrapper-${i}`} className="space-y-3">
            <EmptySlot
              index={i}
              label={t('emptySlotLabel', { index: i + 1 })}
              onClick={handleOpen}
              isLoading={isUploading && i === items.length}
            />
            <div className="h-9 rounded-md bg-muted/40 border border-dashed" />
            <div className="h-[76px] rounded-md bg-muted/40 border border-dashed" />
          </div>
        );
      })}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {t('slotCount', { current: items.length, max: maxSlots })}
        </span>
        {!isBusiness && (
          <button
            type="button"
            onClick={() => onUpgrade?.()}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
          >
            <Crown className="h-3 w-3" />
            {t('upgradeCta')}
          </button>
        )}
      </div>
    </div>
  );
}
