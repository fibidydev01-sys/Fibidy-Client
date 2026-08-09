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
//
// [CROP FIX — Aug 2026]
// Product photos never had the crop flow wired in — openWidget() was a
// plain no-crop file picker (openFilePicker alias), unlike every other
// image-upload surface in the app (Settings > About highlights, Setup
// wizard highlights, hero/appearance), which all go through
// useImageCrop() + ImageCropModal before uploading.
//
// This step now follows that same pattern 1:1. Upload + crop for a
// single slot is extracted into ProductImageUploadSlot below, mirroring
// HighlightImageUpload in step-highlights.tsx:
//   - useCloudinaryUpload({ maxFiles: 1, onFileSelected: openCrop, ... })
//   - useImageCrop() owns the crop modal's open/close/confirm state
//   - uploadBlob() sends the CROPPED blob, not the raw file
//
// Each empty slot gets its OWN upload+crop hook instance (mounted only
// while that slot is being filled), so concurrent crop modals across
// slots can't collide. Multi-file selection is intentionally dropped —
// every other slot-based image uploader in this codebase is one-file-
// per-click, and mixing "select 3 files" with "crop each one" has no
// existing precedent to follow, so we don't invent one here.
//
// Aspect is locked to CROP_ASPECT.SQUARE (no Square/Landscape toggle
// exposed) since every product photo slot renders as aspect-square.

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Crown, GripVertical, Lock } from 'lucide-react';
import type { Area } from 'react-easy-crop';
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
import {
  useCloudinaryUpload,
  type CloudinaryUploadError,
} from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
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

// ─── ProductImageUploadSlot — one empty slot, own upload+crop state ──────────
//
// Mirrors HighlightImageUpload in step-highlights.tsx. Mounted for the
// next-empty slot only; unmounting after a successful upload (the slot
// becomes a FilledImageSlot instead, rendered by the parent) tears down
// this hook instance and its crop modal state automatically.
interface ProductImageUploadSlotProps {
  index: number;
  label: string;
  onUploaded: (url: string) => void;
}

function ProductImageUploadSlot({ index, label, onUploaded }: ProductImageUploadSlotProps) {
  const tToast = useTranslations('toast.upload');
  const [isCropProcessing, setIsCropProcessing] = useState(false);

  const { isOpen: cropOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop } = useImageCrop();

  const handleUploadError = useCallback(
    (retry: () => void) => (error: CloudinaryUploadError) => {
      const descKey =
        error.code === 'FILE_TOO_LARGE' ? 'fileTooLarge' :
          error.code === 'INVALID_FILE_TYPE' ? 'invalidFileType' :
            error.code === 'NETWORK_ERROR' ? 'networkError' :
              error.code === 'CONFIG_MISSING' ? 'configMissing' : 'generic';
      toast.error(tToast('logoFailed'), {
        description: tToast(descKey),
        action:
          error.code === 'NETWORK_ERROR' || error.code === 'CLOUDINARY_REJECTED' || error.code === 'UNKNOWN'
            ? { label: tToast('retryAction'), onClick: retry }
            : undefined,
      });
    },
    [tToast],
  );

  const { isUploading, progress, openFilePicker, uploadBlob } = useCloudinaryUpload({
    folder: 'fibidy/products',
    maxFiles: 1,
    onSuccess: (url) => {
      onUploaded(url);
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError(() => openFilePicker(1)),
    onFileSelected: (file) => {
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

  const handleFileDrop = useCallback((file: File) => {
    openCrop(file, CROP_ASPECT.SQUARE);
  }, [openCrop]);

  const handleCropConfirm = useCallback(
    async (croppedAreaPixels: Area, chosenAspect: AspectChoice) => {
      setIsCropProcessing(true);
      try {
        const blob = await confirmCrop(croppedAreaPixels, chosenAspect);
        closeCrop();
        await uploadBlob(blob, `product-${index + 1}.jpg`);
      } catch {
        toast.error(tToast('logoFailed'), { description: tToast('generic') });
      } finally {
        setIsCropProcessing(false);
      }
    },
    [confirmCrop, closeCrop, uploadBlob, index, tToast],
  );

  return (
    <>
      <EmptySlot
        index={index}
        label={label}
        onClick={() => openFilePicker(1)}
        onFileDrop={handleFileDrop}
        isLoading={isUploading}
        progress={progress}
      />

      <ImageCropModal
        open={cropOpen}
        imageSrc={imageSrc}
        aspect={aspect}
        onConfirm={handleCropConfirm}
        onCancel={() => closeCrop()}
        isProcessing={isCropProcessing}
      />
    </>
  );
}

export function StepMedia({ form, maxImages, tier, onUpgrade }: StepMediaProps) {
  const t = useTranslations('dashboard.products.form.media');

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
        const images: string[] = field.value || [];

        const handleUploaded = (url: string) => {
          const cur = field.value || [];
          if (!cur.includes(url)) {
            field.onChange([...cur, url]);
          }
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
                        // Every empty, unlocked slot gets its own upload+crop
                        // hook instance — clicking slot 2 before slot 1 works
                        // exactly like it did pre-crop. `onUploaded` always
                        // appends to `images`, so whichever slot the seller
                        // fills first becomes images[0], and so on — slot
                        // *position* here is just "which empty slot did they
                        // click", not a fixed index into the final array.
                        return (
                          <ProductImageUploadSlot
                            key={`upload-slot-${i}`}
                            index={i}
                            label={t('photoFallback', { index: i + 1 })}
                            onUploaded={handleUploaded}
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