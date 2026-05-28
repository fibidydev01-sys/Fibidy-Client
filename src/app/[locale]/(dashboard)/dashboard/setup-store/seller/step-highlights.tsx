'use client';

// ============================================================================
// STEP HIGHLIGHTS — Setup Wizard Step 3
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-highlights.tsx
//
// [SPRINT 5 — SCROLL FIX]
// Tambah data-field-error="true" ke wrapper setiap field yang error.
// Field keys per highlight index:
//   - 'highlight-0-image', 'highlight-1-image', 'highlight-2-image'
//   - 'highlight-0-title', 'highlight-1-title', 'highlight-2-title'
//   - 'highlight-0-desc',  'highlight-1-desc',  'highlight-2-desc'
//
// scrollToFirstFieldError() akan pilih yang paling atas — biasanya
// highlight pertama (index 0) yang punya error.
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// [SPRINT 1 — G1 FIX: Upload-Aware Navigation Guard]
// [RENAME — May 2026] feature.icon → feature.image
// ============================================================================

import { useState, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';
import type { Area } from 'react-easy-crop';
import { useCloudinaryUpload, type CloudinaryUploadError } from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
import { EmptySlot } from '@/components/dashboard/shared/image-slot';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AutofillBadge } from './autofill-badge';
import { cn } from '@/lib/shared/utils';
import type { FeatureItem } from '@/types/tenant';

interface StepHighlightsProps {
  items: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
  isAutofilled: (field: string) => boolean;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

const EMPTY_FEATURE: FeatureItem = { image: '', title: '', description: '' };

// ─── HighlightFilledImage ─────────────────────────────────────────────────────

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

// ─── HighlightImageUpload ─────────────────────────────────────────────────────

interface HighlightImageUploadProps {
  index: number;
  imageUrl: string;
  onImageChange: (url: string) => void;
  slotId: string;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
  hasImageError?: boolean;
  onClearImageError?: () => void;
}

function HighlightImageUpload({
  index,
  imageUrl,
  onImageChange,
  slotId,
  onUploadStateChange,
  hasImageError,
  onClearImageError,
}: HighlightImageUploadProps) {
  const tToast = useTranslations('toast.upload');
  const tSlot = useTranslations('dashboard.imageSlot');
  const [isCropProcessing, setIsCropProcessing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadFailed(false);
  }, [imageUrl]);

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
    folder: 'fibidy/highlight-images',
    maxFiles: 1,
    onSuccess: (url) => {
      onImageChange(url);
      onClearImageError?.();
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError(() => openFilePicker(1)),
    onFileSelected: (file) => {
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

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
      {/*
        [SCROLL FIX] data-field-error hanya di image slot container.
        Title dan desc punya wrapper sendiri di parent.
      */}
      <div className={cn(
        'rounded-xl transition-all',
        hasImageError && 'ring-2 ring-destructive ring-offset-2',
      )}>
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
            label={tSlot('uploadImage')}
            onClick={() => openFilePicker(1)}
            onFileDrop={handleFileDrop}
            isLoading={isUploading}
            progress={progress}
          />
        )}
      </div>

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

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepHighlights({
  items,
  onChange,
  isAutofilled,
  onUploadStateChange,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepHighlightsProps) {
  const t = useTranslations('dashboard.setupStore.seller.highlights');

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

      {features.map((feature, i) => {
        const imageKey = `highlight-${i}-image`;
        const titleKey = `highlight-${i}-title`;
        const descKey = `highlight-${i}-desc`;

        const hasImageError = fieldErrors.has(imageKey);
        const hasTitleError = fieldErrors.has(titleKey);
        const hasDescError = fieldErrors.has(descKey);

        return (
          <div key={i} className="border rounded-xl p-4 space-y-4">
            <p className="text-[11px] font-semibold tracking-widests uppercase text-muted-foreground">
              Highlight {i + 1}
            </p>

            {/* Feature image */}
            {/*
              [SCROLL FIX] data-field-error di wrapper image section.
            */}
            <div
              className="space-y-1.5"
              data-field-error={hasImageError ? 'true' : undefined}
            >
              <Label className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
                {t('imageLabel')} <span className="text-destructive normal-case font-normal">*</span>
              </Label>
              <HighlightImageUpload
                index={i}
                imageUrl={feature.image ?? ''}
                onImageChange={(url) => updateFeature(i, { image: url })}
                slotId={`highlight-${i}`}
                onUploadStateChange={onUploadStateChange}
                hasImageError={hasImageError}
                onClearImageError={() => onClearFieldError?.(imageKey)}
              />
              {hasImageError && (
                <p className="text-xs text-destructive font-medium">
                  {t('imageRequired')}
                </p>
              )}
            </div>

            {/* Title */}
            <div
              className="space-y-1.5"
              data-field-error={hasTitleError ? 'true' : undefined}
            >
              <Label className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
                {t('titleLabel')} <span className="text-destructive normal-case font-normal">*</span>
              </Label>
              <Input
                placeholder={t('titlePlaceholder')}
                value={feature.title}
                onChange={(e) => {
                  updateFeature(i, { title: e.target.value });
                  if (hasTitleError) onClearFieldError?.(titleKey);
                }}
                maxLength={15}
                className={cn(
                  'h-10 text-sm font-semibold',
                  hasTitleError && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              {hasTitleError && (
                <p className="text-xs text-destructive font-medium">
                  {t('titleRequired')}
                </p>
              )}
            </div>

            {/* Description */}
            <div
              className="space-y-1.5"
              data-field-error={hasDescError ? 'true' : undefined}
            >
              <Label className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
                {t('descriptionLabel')} <span className="text-destructive normal-case font-normal">*</span>
              </Label>
              <Textarea
                placeholder={t('descriptionPlaceholder')}
                value={feature.description ?? ''}
                onChange={(e) => {
                  updateFeature(i, { description: e.target.value });
                  if (hasDescError) onClearFieldError?.(descKey);
                }}
                maxLength={100}
                rows={2}
                className={cn(
                  'resize-none text-sm',
                  hasDescError && 'border-destructive focus-visible:ring-destructive',
                )}
              />
              <div className="flex justify-between items-center">
                {hasDescError && (
                  <p className="text-xs text-destructive font-medium">
                    {t('descriptionRequired')}
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground tabular-nums ml-auto">
                  {(feature.description ?? '').length}/100
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
