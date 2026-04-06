'use client';

import { useEffect, useRef } from 'react';
import { Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { FilledSlot, EmptySlot, LockedSlot } from '@/components/dashboard/shared/image-slot';
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
}

// ─── Main Component ───────────────────────────────────────────────────────
export function StepHighlights({
  formData,
  updateFormData,
  isBusiness = false,
  onUpgrade,
}: StepHighlightsProps) {
  const itemsRef = useRef<FeatureItem[]>([]);
  const maxSlots = isBusiness ? TOTAL_SLOTS : FREE_SLOTS;
  const items = formData.aboutFeatures;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const { isUploading, openWidget } = useCloudinaryUpload({
    folder: 'fibidy/feature-icons',
    maxFiles: 1,
    multiple: false,
    onSuccess: (url) => {
      const cur = itemsRef.current;
      const newItem: FeatureItem = { icon: url, title: '', description: '' };
      updateFormData('aboutFeatures', [...cur, newItem]);
    },
  });

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
            <FilledSlot
              key={i}
              url={item.icon || ''}
              index={i}
              onRemove={() => handleRemove(i)}
            >
              {/* Title */}
              <div className="relative">
                <Input
                  placeholder="Premium Quality"
                  value={item.title || ''}
                  onChange={(e) => handleTitleChange(i, e.target.value)}
                  className="h-9 text-sm font-semibold pr-10 placeholder:font-normal placeholder:text-muted-foreground/50"
                />
                <span className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono tabular-nums pointer-events-none',
                  (item.title || '').length >= MAX_TITLE - 2
                    ? 'text-amber-500 font-semibold'
                    : 'text-muted-foreground/40'
                )}>
                  {(item.title || '').length}/{MAX_TITLE}
                </span>
              </div>

              {/* Description */}
              <div className="relative">
                <Textarea
                  placeholder="Describe this highlight..."
                  value={item.description || ''}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_DESC)
                      handleUpdate(i, 'description', e.target.value);
                  }}
                  rows={3}
                  className="resize-none text-sm pb-5 placeholder:font-normal placeholder:text-muted-foreground/50"
                />
                <span className={cn(
                  'absolute bottom-2 right-3 text-[10px] font-mono tabular-nums pointer-events-none',
                  (item.description || '').length >= MAX_DESC - 10
                    ? 'text-amber-500 font-semibold'
                    : 'text-muted-foreground/40'
                )}>
                  {(item.description || '').length}/{MAX_DESC}
                </span>
              </div>
            </FilledSlot>
          );
        }

        if (!isBusiness && i >= FREE_SLOTS) {
          return (
            <LockedSlot key={`locked-${i}`} onClick={() => onUpgrade?.()}>
              <div className="h-9 rounded-md bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50" />
              <div className="h-[76px] rounded-md bg-amber-50/60 dark:bg-amber-950/20 border border-dashed border-amber-300/50" />
            </LockedSlot>
          );
        }

        return (
          <EmptySlot
            key={`empty-${i}`}
            index={i}
            label={`Slot ${i + 1}`}
            onClick={handleOpen}
            isLoading={isUploading && i === items.length}
          >
            <div className="h-9 rounded-md bg-muted/40 border border-dashed" />
            <div className="h-[76px] rounded-md bg-muted/40 border border-dashed" />
          </EmptySlot>
        );
      })}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">{items.length} / {maxSlots} highlights</span>
        {!isBusiness && (
          <button
            type="button"
            onClick={() => onUpgrade?.()}
            className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
          >
            <Crown className="h-3 w-3" />
            Upgrade ke Business
          </button>
        )}
      </div>
    </div>
  );
}