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
// The old regex would silently break on locales where "Upgrade to" doesn't
// exist verbatim (e.g. ID: "Upgrade ke Starter"). Also, `nextTierLabel` was
// only being used as a truthy gate and never actually rendered — so the
// regex was dead code that would have misbehaved the moment anyone tried
// to render it. Now both the CTA label and tier name are proper i18n keys.

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, GripVertical } from 'lucide-react';
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
import { FilledSlot, EmptySlot, LockedSlot } from '@/components/dashboard/shared/image-slot';
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

export function StepMedia({ form, maxImages, tier, onUpgrade }: StepMediaProps) {
  const t = useTranslations('dashboard.products.form.media');
  const imagesRef = useRef<string[]>([]);

  const { isUploading, openWidget } = useCloudinaryUpload({
    folder: 'fibidy/products',
    multiple: true,
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
  // Now sourced from dedicated i18n keys — no more regex stripping.
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
                            <FilledSlot
                              key={images[i]}
                              url={images[i]}
                              index={i}
                              onRemove={() => handleRemove(images[i])}
                              draggable
                            />
                          );
                        }
                        if (i >= maxImages) {
                          return <LockedSlot key={`locked-${i}`} onClick={onUpgrade} />;
                        }
                        return (
                          <EmptySlot
                            key={`empty-${i}`}
                            index={i}
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