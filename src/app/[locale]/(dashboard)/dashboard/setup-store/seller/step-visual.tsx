'use client';

// ============================================================================
// STEP VISUAL — Setup Wizard Step 1
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-visual.tsx
//
// [SPRINT 5 — SCROLL FIX]
// Tambah data-field-error="true" ke wrapper setiap field yang error.
// Dipakai oleh scrollToFirstFieldError() di orchestrator untuk
// menemukan dan scroll ke field error paling atas di DOM.
//
// Field keys dan data-field-error placement:
//   - logo         → div wrapper EmptySlot (hasLogoError)
//   - primaryColor → div wrapper ColorPicker (hasColorError)
//   - heroBg       → div wrapper EmptySlot (hasHeroBgError)
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// [SPRINT 1 — G1 FIX: Upload-Aware Navigation Guard]
// [ASPECT TOGGLE — May 2026]
// [UPLOAD GUARD FIX — May 2026]
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Square, RectangleHorizontal } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload, type CloudinaryUploadError } from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
import { EmptySlot, FilledImageSlot } from '@/components/dashboard/shared/image-slot';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import { AutofillBadge } from './autofill-badge';
import { LogoGenerator } from './logo-generator';
import type { Area } from 'react-easy-crop';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepVisualProps {
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  storeName: string;
  onLogoChange: (url: string) => void;
  onColorChange: (hex: string) => void;
  onHeroBgChange: (url: string) => void;
  isAutofilled: (field: string) => boolean;
  onUploadStateChange?: (slotId: string, active: boolean) => void;
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

// ─── Aspect Badge ─────────────────────────────────────────────────────────────

function AspectBadge({ aspect }: { aspect: AspectChoice | null }) {
  if (!aspect) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted border px-2 py-0.5 text-[10px] font-medium text-muted-foreground select-none">
      {aspect === 'square' ? (
        <><Square className="h-2.5 w-2.5" />1:1</>
      ) : (
        <><RectangleHorizontal className="h-2.5 w-2.5" />16:9</>
      )}
    </span>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center flex-wrap gap-2 rounded-lg p-2 transition-colors',
        hasError && 'ring-2 ring-destructive ring-offset-2',
      )}
    >
      {THEME_COLORS.map((color) => {
        const active = value === color.value;
        return (
          <button
            key={color.value}
            type="button"
            title={color.name}
            onClick={() => onChange(color.value)}
            className={cn(
              'rounded-full transition-all duration-150 focus-visible:outline-none p-1',
              active && 'ring-2 ring-offset-2 ring-offset-background',
            )}
            style={active ? ({ '--tw-ring-color': color.value } as React.CSSProperties) : undefined}
          >
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-transform',
              color.class,
              active && 'scale-105',
            )}>
              {active && (
                <svg className="w-3.5 h-3.5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepVisual({
  logo,
  primaryColor,
  heroBackgroundImage,
  storeName,
  onLogoChange,
  onColorChange,
  onHeroBgChange,
  isAutofilled,
  onUploadStateChange,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepVisualProps) {
  const t = useTranslations('dashboard.setupStore.seller.visual');
  const tToast = useTranslations('toast.upload');

  const hasLogoError = fieldErrors.has('logo');
  const hasColorError = fieldErrors.has('primaryColor');
  const hasHeroBgError = fieldErrors.has('heroBackgroundImage');

  const [activeCropSlot, setActiveCropSlot] = useState<'logo' | 'heroBg' | null>(null);
  const [isCropProcessing, setIsCropProcessing] = useState(false);
  const [logoAspect, setLogoAspect] = useState<AspectChoice | null>(null);
  const [heroBgAspect, setHeroBgAspect] = useState<AspectChoice | null>(null);

  const { isOpen: cropOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop } = useImageCrop();

  const handleUploadError = useCallback(
    (slotName: 'logo' | 'heroBg', retry: () => void) =>
      (error: CloudinaryUploadError) => {
        const titleKey = slotName === 'logo' ? 'logoFailed' : 'heroBgFailed';
        const descKey =
          error.code === 'FILE_TOO_LARGE' ? 'fileTooLarge' :
            error.code === 'INVALID_FILE_TYPE' ? 'invalidFileType' :
              error.code === 'NETWORK_ERROR' ? 'networkError' :
                error.code === 'CONFIG_MISSING' ? 'configMissing' : 'generic';
        toast.error(tToast(titleKey), {
          description: tToast(descKey),
          action: error.code === 'NETWORK_ERROR' || error.code === 'CLOUDINARY_REJECTED' || error.code === 'UNKNOWN'
            ? { label: tToast('retryAction'), onClick: retry }
            : undefined,
        });
      },
    [tToast],
  );

  const {
    isUploading: isUploadingLogo,
    progress: logoProgress,
    openFilePicker: openLogoFilePicker,
    uploadBlob: uploadLogoBlob,
  } = useCloudinaryUpload({
    folder: 'fibidy/logos',
    maxFiles: 1,
    onSuccess: (url) => {
      onLogoChange(url);
      onClearFieldError?.('logo');
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError('logo', () => openLogoFilePicker(1)),
    onFileSelected: (file) => {
      setActiveCropSlot('logo');
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

  const {
    isUploading: isUploadingHeroBg,
    progress: heroBgProgress,
    openFilePicker: openHeroBgFilePicker,
    uploadBlob: uploadHeroBgBlob,
  } = useCloudinaryUpload({
    folder: 'fibidy/hero-backgrounds',
    maxFiles: 1,
    onSuccess: (url) => {
      onHeroBgChange(url);
      onClearFieldError?.('heroBackgroundImage');
      toast.success(tToast('heroBgSuccess'));
    },
    onError: handleUploadError('heroBg', () => openHeroBgFilePicker(1)),
    onFileSelected: (file) => {
      setActiveCropSlot('heroBg');
      openCrop(file, CROP_ASPECT.HERO);
    },
  });

  useEffect(() => {
    onUploadStateChange?.('logo', isUploadingLogo);
  }, [isUploadingLogo, onUploadStateChange]);

  useEffect(() => {
    onUploadStateChange?.('heroBg', isUploadingHeroBg);
  }, [isUploadingHeroBg, onUploadStateChange]);

  const handleLogoDrop = useCallback((file: File) => {
    setActiveCropSlot('logo');
    openCrop(file, CROP_ASPECT.SQUARE);
  }, [openCrop]);

  const handleHeroBgDrop = useCallback((file: File) => {
    setActiveCropSlot('heroBg');
    openCrop(file, CROP_ASPECT.HERO);
  }, [openCrop]);

  const handleCropConfirm = useCallback(
    async (croppedAreaPixels: Area, chosenAspect: AspectChoice) => {
      setIsCropProcessing(true);
      try {
        const blob = await confirmCrop(croppedAreaPixels, chosenAspect);
        closeCrop();
        if (activeCropSlot === 'logo') {
          setLogoAspect(chosenAspect);
          await uploadLogoBlob(blob, 'logo.jpg');
        } else if (activeCropSlot === 'heroBg') {
          setHeroBgAspect(chosenAspect);
          await uploadHeroBgBlob(blob, 'hero-bg.jpg');
        }
      } catch {
        toast.error(tToast('logoFailed'), { description: tToast('generic') });
      } finally {
        setIsCropProcessing(false);
        setActiveCropSlot(null);
      }
    },
    [activeCropSlot, confirmCrop, closeCrop, uploadLogoBlob, uploadHeroBgBlob, tToast],
  );

  const handleCropCancel = useCallback(() => {
    closeCrop();
    setActiveCropSlot(null);
  }, [closeCrop]);

  const handleGenerateStateChange = useCallback(
    (active: boolean) => {
      onUploadStateChange?.('logo-generator', active);
    },
    [onUploadStateChange],
  );

  return (
    <div className="space-y-10 max-w-sm mx-auto text-center">

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
            {t('logoLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </p>
          <p className="text-xs text-muted-foreground">{t('logoHelper')}</p>
        </div>

        {logo ? (
          <div className="space-y-1.5">
            <FilledImageSlot
              url={logo}
              alt="Store logo"
              onRemove={() => { onLogoChange(''); setLogoAspect(null); }}
            />
            <div className="flex justify-center">
              <AspectBadge aspect={logoAspect ?? (logo ? 'square' : null)} />
            </div>
          </div>
        ) : (
          <>
            {/*
              [SCROLL FIX] data-field-error="true" saat logo error.
              scrollToFirstFieldError() akan menemukan div ini dan scroll ke sini.
            */}
            <div
              data-field-error={hasLogoError ? 'true' : undefined}
              className={cn(
                'rounded-xl transition-all',
                hasLogoError && 'ring-2 ring-destructive ring-offset-2',
              )}
            >
              <EmptySlot
                index={0}
                label={t('uploadLogo')}
                onClick={() => openLogoFilePicker(1)}
                onFileDrop={handleLogoDrop}
                isLoading={isUploadingLogo}
                progress={logoProgress}
              />
            </div>
            {hasLogoError && (
              <p className="text-xs text-destructive font-medium">
                {t('logoRequired')}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-[11px] text-muted-foreground/50">{t('logoGenerateOr')}</span>
              <LogoGenerator
                storeName={storeName}
                primaryColor={primaryColor}
                onGenerated={(url) => {
                  onLogoChange(url);
                  onClearFieldError?.('logo');
                }}
                disabled={isUploadingLogo}
                onGenerateStateChange={handleGenerateStateChange}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Brand Color ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
            {t('colorLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </p>
          <AutofillBadge visible={isAutofilled('primaryColor')} />
          <p className="text-xs text-muted-foreground">{t('colorHelper')}</p>
        </div>
        {/*
          [SCROLL FIX] data-field-error="true" saat color error.
        */}
        <div data-field-error={hasColorError ? 'true' : undefined}>
          <ColorPicker
            value={primaryColor}
            onChange={onColorChange}
            hasError={hasColorError}
          />
        </div>
        {hasColorError && (
          <p className="text-xs text-destructive font-medium">
            {t('colorRequired')}
          </p>
        )}
        {primaryColor && <p className="text-xs font-mono text-muted-foreground">{primaryColor}</p>}
      </div>

      {/* ── Hero Background ───────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground">
            {t('heroBgLabel')} <span className="text-destructive normal-case font-normal">*</span>
          </p>
          <AutofillBadge visible={isAutofilled('heroBackgroundImage')} />
          <p className="text-xs text-muted-foreground">{t('heroBgHelper')}</p>
        </div>

        {heroBackgroundImage ? (
          <div className="space-y-1.5">
            <FilledImageSlot
              url={heroBackgroundImage}
              alt="Hero background"
              onRemove={() => { onHeroBgChange(''); setHeroBgAspect(null); }}
            />
            <div className="flex justify-center">
              <AspectBadge aspect={heroBgAspect ?? (heroBackgroundImage ? 'landscape' : null)} />
            </div>
          </div>
        ) : (
          <>
            {/*
              [SCROLL FIX] data-field-error="true" saat heroBg error.
            */}
            <div
              data-field-error={hasHeroBgError ? 'true' : undefined}
              className={cn(
                'rounded-xl transition-all',
                hasHeroBgError && 'ring-2 ring-destructive ring-offset-2',
              )}
            >
              <EmptySlot
                index={0}
                label={t('uploadHeroBg')}
                onClick={() => openHeroBgFilePicker(1)}
                onFileDrop={handleHeroBgDrop}
                isLoading={isUploadingHeroBg}
                progress={heroBgProgress}
              />
            </div>
            {hasHeroBgError && (
              <p className="text-xs text-destructive font-medium">
                {t('heroBgRequired')}
              </p>
            )}
          </>
        )}
      </div>

      {/* ── Crop Modal ────────────────────────────────────────────────────── */}
      <ImageCropModal
        open={cropOpen}
        imageSrc={imageSrc}
        aspect={aspect}
        onConfirm={handleCropConfirm}
        onCancel={handleCropCancel}
        isProcessing={isCropProcessing}
      />

    </div>
  );
}
