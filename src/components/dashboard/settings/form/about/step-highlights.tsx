'use client';

// ============================================================================
// STEP HIGHLIGHTS — Settings About Form
// File: src/components/dashboard/settings/form/about/step-highlights.tsx
//
// [BACKPORT FULL — 2026-05-28]
// Full 1:1 parity dengan Setup wizard step-highlights.tsx:
//
//   ✅ useCloudinaryUpload per slot dengan onFileSelected → crop flow
//   ✅ useImageCrop + ImageCropModal per slot
//   ✅ Drag & drop via onFileDrop di EmptySlot
//   ✅ Upload progress per slot (via HighlightFilledImage)
//   ✅ onUploadStateChange per slot → parent AboutSection untuk upload guard
//   ✅ Error toast dengan retry action
//   ✅ Mobile trash always visible (sm:opacity-0 desktop hover)
//   ✅ AbortController / cancelUpload (via useCloudinaryUpload hook)
//   ✅ Smooth progress fade (via UploadingOverlay di image-slot.tsx)
//
// [RENAME — May 2026] item.icon → item.image
// ============================================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Crown, Lock, Trash2, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import type { Area } from 'react-easy-crop';
import {
  useCloudinaryUpload,
  type CloudinaryUploadError,
} from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
import { EmptySlot } from '@/components/dashboard/shared/image-slot';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shared/utils';
import type { AboutFormData, FeatureItem } from '@/types/tenant';

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SLOTS = 7;
const FREE_SLOTS  = 4;
const MAX_TITLE   = 15;
const MAX_DESC    = 100;

// ─── Props ────────────────────────────────────────────────────────────────────
interface StepHighlightsProps {
  formData: AboutFormData;
  updateFormData: <K extends keyof AboutFormData>(key: K, value: AboutFormData[K]) => void;
  isBusiness?: boolean;
  onUpgrade?: () => void;
  /** Track upload state per slot ke parent untuk upload guard sebelum save */
  onUploadStateChange?: (slotId: string, active: boolean) => void;
}

// ─── LockedSlot ───────────────────────────────────────────────────────────────
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

// ─── HighlightFilledImage — identik dengan Setup (A3 fix: mobile trash) ───────
interface HighlightFilledImageProps {
  url: string;
  index: number;
  isUploading: boolean;
  progress: number;
  onRemove: () => void;
  onLoadFail: () => void;
}

function HighlightFilledImage({
  url,
  index,
  isUploading,
  progress,
  onRemove,
  onLoadFail,
}: HighlightFilledImageProps) {
  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Highlight ${index + 1}`}
        className="w-full h-full object-cover transition-[filter] duration-200 sm:group-hover:brightness-75"
        onError={onLoadFail}
      />

      {isUploading && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            {progress > 0 && progress < 100 && (
              <span className="text-xs font-mono tabular-nums font-semibold">
                {progress}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* [A3 FIX] Mobile trash always visible, desktop hover-only */}
      {!isUploading && (
        <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            aria-label="Remove image"
            className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── HighlightImageUpload — per slot, identik dengan Setup ────────────────────
interface HighlightImageUploadProps {
  index: number;
  imageUrl: string;
  onImageChange: (url: string) => void;
  slotId: string;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
}

function HighlightImageUpload({
  index,
  imageUrl,
  onImageChange,
  slotId,
  onUploadStateChange,
}: HighlightImageUploadProps) {
  const tToast = useTranslations('toast.upload');
  const [isCropProcessing, setIsCropProcessing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [imageUrl]);

  const { isOpen: cropOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop } = useImageCrop();

  const handleUploadError = useCallback(
    (retry: () => void) => (error: CloudinaryUploadError) => {
      const descKey =
        error.code === 'FILE_TOO_LARGE'    ? 'fileTooLarge'   :
        error.code === 'INVALID_FILE_TYPE' ? 'invalidFileType':
        error.code === 'NETWORK_ERROR'     ? 'networkError'   :
        error.code === 'CONFIG_MISSING'    ? 'configMissing'  : 'generic';
      toast.error(tToast('logoFailed'), {
        description: tToast(descKey),
        action:
          error.code === 'NETWORK_ERROR' ||
          error.code === 'CLOUDINARY_REJECTED' ||
          error.code === 'UNKNOWN'
            ? { label: tToast('retryAction'), onClick: retry }
            : undefined,
      });
    },
    [tToast],
  );

  const { isUploading, progress, openFilePicker, uploadBlob } = useCloudinaryUpload({
    folder: 'fibidy/highlight-images',
    maxFiles: 1,
    onSuccess: (url) => {
      onImageChange(url);
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError(() => openFilePicker(1)),
    onFileSelected: (file) => {
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

  // Report upload state ke parent
  useEffect(() => {
    onUploadStateChange?.(slotId, isUploading);
  }, [isUploading, slotId, onUploadStateChange]);

  const handleFileDrop = useCallback((file: File) => {
    openCrop(file, CROP_ASPECT.SQUARE);
  }, [openCrop]);

  const handleCropConfirm = useCallback(
    async (croppedAreaPixels: Area, chosenAspect: AspectChoice) => {
      setIsCropProcessing(true);
      try {
        const blob = await confirmCrop(croppedAreaPixels, chosenAspect);
        closeCrop();
        await uploadBlob(blob, `highlight-${index + 1}.jpg`);
      } catch {
        toast.error(tToast('logoFailed'), { description: tToast('generic') });
      } finally {
        setIsCropProcessing(false);
      }
    },
    [confirmCrop, closeCrop, uploadBlob, index, tToast],
  );

  const showFilled = !!imageUrl && !loadFailed;

  return (
    <>
      {showFilled ? (
        <HighlightFilledImage
          url={imageUrl}
          index={index}
          isUploading={isUploading}
          progress={progress}
          onRemove={() => onImageChange('')}
          onLoadFail={() => setLoadFailed(true)}
        />
      ) : (
        <EmptySlot
          index={index}
          label="Upload gambar"
          onClick={() => openFilePicker(1)}
          onFileDrop={handleFileDrop}
          isLoading={isUploading}
          progress={progress}
        />
      )}

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

// ─── HighlightCard (filled item — text fields) ────────────────────────────────
interface HighlightCardProps {
  item: FeatureItem;
  index: number;
  onRemove: () => void;
  onTitleChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onImageChange: (url: string) => void;
  slotId: string;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
  t: ReturnType<typeof useTranslations<'settings.about'>>;
}

function HighlightCard({
  item,
  index,
  onRemove,
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  slotId,
  onUploadStateChange,
  t,
}: HighlightCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      {/* Remove button header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
          Highlight {index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove highlight"
          className="p-1.5 rounded-full bg-muted/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Image slot with full crop + drag drop */}
      <HighlightImageUpload
        index={index}
        imageUrl={item.image ?? ''}
        onImageChange={onImageChange}
        slotId={slotId}
        onUploadStateChange={onUploadStateChange}
      />

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

// ─── Main Component ───────────────────────────────────────────────────────────
export function StepHighlights({
  formData,
  updateFormData,
  isBusiness = false,
  onUpgrade,
  onUploadStateChange,
}: StepHighlightsProps) {
  const t = useTranslations('settings.about');
  const maxSlots = isBusiness ? TOTAL_SLOTS : FREE_SLOTS;
  const items = formData.aboutFeatures;

  // Track items ref untuk closure di onSuccess
  const itemsRef = useRef<FeatureItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Upload hook untuk "add new slot" (EmptySlot yang belum ada item)
  const { isUploading: isUploadingNew, openWidget: openNewWidget } = useCloudinaryUpload({
    folder: 'fibidy/highlight-images',
    maxFiles: 1,
    onSuccess: (url) => {
      const cur = itemsRef.current;
      const newItem: FeatureItem = { image: url, title: '', description: '' };
      updateFormData('aboutFeatures', [...cur, newItem]);
    },
  });

  useEffect(() => {
    onUploadStateChange?.('highlights-new', isUploadingNew);
  }, [isUploadingNew, onUploadStateChange]);

  const handleOpenNew = () => {
    if (items.length >= maxSlots) return;
    openNewWidget(1);
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

        // Filled slot — HighlightCard dengan crop + drag drop
        if (item) {
          return (
            <HighlightCard
              key={i}
              item={item}
              index={i}
              onRemove={() => handleRemove(i)}
              onTitleChange={(val) => handleTitleChange(i, val)}
              onDescriptionChange={(val) => handleUpdate(i, 'description', val)}
              onImageChange={(url) => handleUpdate(i, 'image', url)}
              slotId={`highlight-${i}`}
              onUploadStateChange={onUploadStateChange}
              t={t}
            />
          );
        }

        // Locked slot
        if (!isBusiness && i >= FREE_SLOTS) {
          return (
            <LockedSlotInline key={`locked-${i}`} onClick={() => onUpgrade?.()} />
          );
        }

        // Empty slot — untuk menambah item baru
        return (
          <div key={`empty-wrapper-${i}`} className="space-y-3">
            <EmptySlot
              index={i}
              label={t('emptySlotLabel', { index: i + 1 })}
              onClick={handleOpenNew}
              isLoading={isUploadingNew && i === items.length}
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
