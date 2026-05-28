'use client';

// ─── Step 2: Media — tier-aware ──────────────────────────────────────────
// Image slots based on actual subscription tier:
//   FREE:     2 slots
//   STARTER:  3 slots
//   BUSINESS: 5 slots
// Locked slots show upgrade prompt
//
// [i18n FIX — 2026-04-19]
// Replaced fragile `t('upgradeToStarter').replace(/^Upgrade to\s+/i, '')`
// with dedicated `tierName.starter` / `tierName.business` JSON keys.
//
// [FIX — May 2026]
// image-slot.tsx (Sprint 1.3 refactor) no longer exports FilledSlot or
// LockedSlot. Updated imports:
//   - FilledSlot  → FilledImageSlot
//   - LockedSlot  → inline locked UI (button with Crown badge)
// Also removed `multiple` from useCloudinaryUpload options (not in type)
// and added required `label` prop to EmptySlot.

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, GripVertical, Lock } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { TOTAL_SLOTS } from '@/lib/constants/shared/constants';
import { FilledImageSlot, EmptySlot } from '@/components/dashboard/shared/image-slot';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormData } from '@/lib/shared/validations';
import type { SubscriptionTier } from '@/lib/api/subscription';

interface StepMediaProps {
  form: UseFormReturn<ProductFormData>;
  maxImages: number;
  /** Subscription tier — determines which slots are locked */
  tier: SubscriptionTier;
  onUpgrade: () => void;
}

// ─── Inline locked slot (replaces removed LockedSlot export) ─────────────────
function LockedSlotInline({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative aspect-square w-full rounded-xl border-2 border-dashed border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/10 flex flex-col items-center justify-center gap-2 p-4 transition-colors hover:bg-amber-50/60 dark:hover:bg-amber-950/20"
    >
      <Lock className="h-5 w-5 text-amber-500/70" aria-hidden />
      <Crown className="h-3.5 w-3.5 text-amber-500" aria-hidden />
    </button>
  );
}

export function StepMedia({ form, maxImages, tier, onUpgrade }: StepMediaProps) {
  const t = useTranslations('dashboard.products.form.media');
  const imagesRef = useRef<string[]>([]);

  const { isUploading, openWidget } = useCloudinaryUpload({
    folder: 'fibidy/products',
    // `multiple` is not part of CloudinaryUploadOptions — removed.
    // Pass maxFiles via openWidget(slots) call instead.
    onSuccess: (url) => {
      const cur = imagesRef.current;
      if (!cur.includes(url)) {
        form.setValue('images', [...cur, url]);
      }
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Next tier name (used as truthy gate for CTA button render).
  const nextTierLabel =
    tier === 'FREE' ? t('tierName.starter') :
      tier === 'STARTER' ? t('tierName.business') :
        null;

  // Full CTA label (kept for button use)
  const upgradeCtaLabel =
    tier === 'FREE' ? t('upgradeToStarter') :
      tier === 'STARTER' ? t('upgradeToBusiness') :
        null;

  // Slot description based on tier
  const slotDescription =
    tier === 'BUSINESS'
      ? t('descriptionBusiness')
      : tier === 'STARTER'
        ? t('descriptionStarter')
        : t('descriptionFree');

  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => {
        imagesRef.current = field.value || [];
        const images: string[] = field.value || [];

        const handleOpen = () => {
          const slots = maxImages - images.length;
          openWidget(slots);
        };

        const handleRemove = (url: string) =>
          field.onChange(images.filter((u) => u !== url));

        const handleDragEnd = ({ active, over }: DragEndEvent) => {
          if (!over || active.id === over.id) return;
          const from = images.indexOf(active.id as string);
          const to = images.indexOf(over.id as string);
          field.onChange(arrayMove(images, from, to));
        };

        return (
          <FormItem>
            <FormControl>
              <div className="space-y-4">

                {/* Context label */}
                <div className="rounded-xl border px-4 py-3 text-sm bg-muted/50 border-border text-muted-foreground">
                  <p>
                    <span className="font-semibold">{t('headerPrefix')}</span>{' '}
                    {slotDescription}
                  </p>
                </div>

                {/* 5 slot grid */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {Array.from({ length: TOTAL_SLOTS }).map((_, i) => {
                        if (i < images.length) {
                          return (
                            <FilledImageSlot
                              key={images[i]}
                              url={images[i]}
                              alt={t('photoFallback', { index: i + 1 })}
                              onRemove={() => handleRemove(images[i])}
                            />
                          );
                        }
                        if (i >= maxImages) {
                          return (
                            <LockedSlotInline key={`locked-${i}`} onClick={onUpgrade} />
                          );
                        }
                        return (
                          <EmptySlot
                            key={`empty-${i}`}
                            index={i}
                            label={t('photoFallback', { index: i + 1 })}
                            onClick={handleOpen}
                            isLoading={isUploading && i === images.length}
                          />
                        );
                      })}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="tabular-nums">{t('slotCount', { current: images.length, max: maxImages })}</span>
                  <div className="flex items-center gap-3">
                    {images.length > 1 && (
                      <span className="flex items-center gap-1 opacity-60">
                        <GripVertical className="h-3 w-3" />
                        {t('dragReorder')}
                      </span>
                    )}
                    {upgradeCtaLabel && nextTierLabel && (
                      <button
                        type="button"
                        onClick={onUpgrade}
                        className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <Crown className="h-3 w-3" />
                        {upgradeCtaLabel}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}