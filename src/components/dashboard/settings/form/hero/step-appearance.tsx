'use client';

// ============================================================================
// STEP APPEARANCE — Settings Hero Form
// File: src/components/dashboard/settings/form/hero/step-appearance.tsx
//
// [BACKPORT FULL — 2026-05-28]
// Full 1:1 parity dengan Setup wizard step-visual.tsx:
//
//   ✅ useImageCrop + ImageCropModal (react-easy-crop)
//   ✅ onFileSelected → crop flow → uploadBlob
//   ✅ Drag & drop via onFileDrop di EmptySlot
//   ✅ AspectBadge (Square/Landscape indicator)
//   ✅ LogoGenerator (SVG initials → Cloudinary)
//   ✅ Upload progress + smooth fade (via UploadingOverlay di FilledImageSlot)
//   ✅ cancelUpload / AbortController (via useCloudinaryUpload)
//   ✅ onUploadStateChange → parent HeroSection untuk upload guard
//   ✅ Error toast dengan retry action
//   ✅ FilledImageSlot untuk preview + remove
//
// Perbedaan minimal vs step-visual.tsx:
//   - Tidak ada fieldErrors / data-field-error (Settings tidak pakai scroll fix)
//   - onRemoveLogo / onRemoveHeroBg di-handle oleh parent HeroSection
//     (Settings perlu API call saat remove, Setup hanya clear state)
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Square, RectangleHorizontal } from 'lucide-react';
import { cn } from '@/lib/shared/utils';
import {
  useCloudinaryUpload,
  type CloudinaryUploadError,
} from '@/hooks/shared/use-cloudinary-upload';
import { useImageCrop, CROP_ASPECT } from '@/hooks/shared/use-image-crop';
import { ImageCropModal, type AspectChoice } from '@/components/dashboard/shared/image-crop-modal';
import { EmptySlot, FilledImageSlot } from '@/components/dashboard/shared/image-slot';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import type { HeroFormData } from '@/types/tenant';
import type { Area } from 'react-easy-crop';

// ─── LogoGenerator (inline — identik dengan Setup) ───────────────────────────

function getInitials(storeName: string): string {
  const words = storeName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function generateLogoSvg(initials: string, bgColor: string): string {
  const fontSize = initials.length === 1 ? 110 : 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400">
    <rect width="200" height="200" fill="${bgColor}" rx="20"/>
    <text
      x="100" y="100"
      font-family="Inter, system-ui, -apple-system, sans-serif"
      font-size="${fontSize}"
      font-weight="700"
      fill="white"
      text-anchor="middle"
      dominant-baseline="central"
      letter-spacing="-2"
    >${initials}</text>
  </svg>`;
}

interface LogoGeneratorProps {
  storeName: string;
  primaryColor: string;
  onGenerated: (url: string) => void;
  disabled?: boolean;
  onGenerateStateChange?: (active: boolean) => void;
}

function LogoGenerator({
  storeName,
  primaryColor,
  onGenerated,
  disabled = false,
  onGenerateStateChange,
}: LogoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!storeName.trim() || isGenerating) return;

    setIsGenerating(true);
    onGenerateStateChange?.(true);

    try {
      const initials = getInitials(storeName);
      const color = primaryColor || '#6366F1';
      const svg = generateLogoSvg(initials, color);
      const blob = new Blob([svg], { type: 'image/svg+xml' });

      const formData = new FormData();
      formData.append('file', blob, `logo-${initials.toLowerCase()}.svg`);
      formData.append(
        'upload_preset',
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'fibidy_unsigned',
      );
      formData.append('folder', 'fibidy/logos');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) throw new Error('Cloudinary cloud name not configured');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!response.ok) throw new Error(`Upload failed: ${response.status}`);

      const data = (await response.json()) as { secure_url: string };
      onGenerated(data.secure_url);
      toast.success('Logo berhasil dibuat');
    } catch (err) {
      console.error('[LogoGenerator] Error:', err);
      toast.error('Gagal membuat logo');
    } finally {
      setIsGenerating(false);
      onGenerateStateChange?.(false);
    }
  }, [storeName, primaryColor, onGenerated, isGenerating, onGenerateStateChange]);

  if (!storeName.trim()) return null;

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className="inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-muted-foreground hover:text-foreground"
    >
      {isGenerating ? (
        <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
        </svg>
      )}
      {isGenerating ? 'Membuat...' : 'Generate dari nama'}
    </button>
  );
}

// ─── AspectBadge (identik dengan Setup) ──────────────────────────────────────

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

// ─── ColorPicker ──────────────────────────────────────────────────────────────

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-center flex-wrap gap-2">
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
            style={active ? ({ ['--tw-ring-color' as string]: color.value } as React.CSSProperties) : undefined}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-transform',
                color.class,
                active && 'scale-105',
              )}
            >
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface StepAppearanceProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
  onRemoveHeroBg: () => void;
  isRemovingHeroBg: boolean;
  onRemoveLogo: () => void;
  isRemovingLogo: boolean;
  /** Track upload state ke parent untuk upload guard sebelum save */
  onUploadStateChange?: (slot: string, active: boolean) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StepAppearance({
  formData,
  updateFormData,
  onRemoveHeroBg,
  isRemovingHeroBg,
  onRemoveLogo,
  isRemovingLogo,
  onUploadStateChange,
}: StepAppearanceProps) {
  const t = useTranslations('settings.hero.appearance');
  const tToast = useTranslations('toast.upload');

  // ── Active crop slot tracker ─────────────────────────────────────────────
  const [activeCropSlot, setActiveCropSlot] = useState<'logo' | 'heroBg' | null>(null);
  const [isCropProcessing, setIsCropProcessing] = useState(false);

  // ── Aspect state (logo + heroBg) — identik Setup ─────────────────────────
  const [logoAspect, setLogoAspect] = useState<AspectChoice | null>(null);
  const [heroBgAspect, setHeroBgAspect] = useState<AspectChoice | null>(null);

  // ── Shared crop hook ─────────────────────────────────────────────────────
  const { isOpen: cropOpen, imageSrc, aspect, openCrop, closeCrop, confirmCrop } = useImageCrop();

  // ── Error handler factory — identik Setup ────────────────────────────────
  const handleUploadError = useCallback(
    (slotName: 'logo' | 'heroBg', retry: () => void) =>
      (error: CloudinaryUploadError) => {
        const titleKey = slotName === 'logo' ? 'logoFailed' : 'heroBgFailed';
        const descKey =
          error.code === 'FILE_TOO_LARGE'    ? 'fileTooLarge'   :
          error.code === 'INVALID_FILE_TYPE' ? 'invalidFileType':
          error.code === 'NETWORK_ERROR'     ? 'networkError'   :
          error.code === 'CONFIG_MISSING'    ? 'configMissing'  : 'generic';
        toast.error(tToast(titleKey), {
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

  // ── Logo upload hook ─────────────────────────────────────────────────────
  const {
    isUploading: isUploadingLogo,
    progress: logoProgress,
    openFilePicker: openLogoFilePicker,
    uploadBlob: uploadLogoBlob,
  } = useCloudinaryUpload({
    folder: 'fibidy/logos',
    maxFiles: 1,
    onSuccess: (url) => {
      updateFormData('logo', url);
      toast.success(tToast('logoSuccess'));
    },
    onError: handleUploadError('logo', () => openLogoFilePicker(1)),
    onFileSelected: (file) => {
      setActiveCropSlot('logo');
      openCrop(file, CROP_ASPECT.SQUARE);
    },
  });

  // ── Hero BG upload hook ──────────────────────────────────────────────────
  const {
    isUploading: isUploadingHeroBg,
    progress: heroBgProgress,
    openFilePicker: openHeroBgFilePicker,
    uploadBlob: uploadHeroBgBlob,
  } = useCloudinaryUpload({
    folder: 'fibidy/hero-backgrounds',
    maxFiles: 1,
    onSuccess: (url) => {
      updateFormData('heroBackgroundImage', url);
      toast.success(tToast('heroBgSuccess'));
    },
    onError: handleUploadError('heroBg', () => openHeroBgFilePicker(1)),
    onFileSelected: (file) => {
      setActiveCropSlot('heroBg');
      openCrop(file, CROP_ASPECT.HERO);
    },
  });

  // ── Report upload state ke parent ────────────────────────────────────────
  useEffect(() => {
    onUploadStateChange?.('logo', isUploadingLogo);
  }, [isUploadingLogo, onUploadStateChange]);

  useEffect(() => {
    onUploadStateChange?.('heroBg', isUploadingHeroBg);
  }, [isUploadingHeroBg, onUploadStateChange]);

  // ── Drag & drop handlers — identik Setup ─────────────────────────────────
  const handleLogoDrop = useCallback((file: File) => {
    setActiveCropSlot('logo');
    openCrop(file, CROP_ASPECT.SQUARE);
  }, [openCrop]);

  const handleHeroBgDrop = useCallback((file: File) => {
    setActiveCropSlot('heroBg');
    openCrop(file, CROP_ASPECT.HERO);
  }, [openCrop]);

  // ── Crop confirm — identik Setup ─────────────────────────────────────────
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

  // ── LogoGenerator upload state ───────────────────────────────────────────
  const handleGenerateStateChange = useCallback(
    (active: boolean) => {
      onUploadStateChange?.('logo-generator', active);
    },
    [onUploadStateChange],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-sm mx-auto text-center">

      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('logoHeading')}
          </p>
          <p className="text-xs text-muted-foreground">{t('logoDescription')}</p>
        </div>

        {formData.logo ? (
          <div className="space-y-1.5">
            <FilledImageSlot
              url={formData.logo}
              alt="Store logo"
              onRemove={onRemoveLogo}
              isRemoving={isRemovingLogo}
            />
            <div className="flex justify-center">
              <AspectBadge aspect={logoAspect ?? (formData.logo ? 'square' : null)} />
            </div>
          </div>
        ) : (
          <>
            <EmptySlot
              index={0}
              label={t('logoUploadLabel')}
              onClick={() => openLogoFilePicker(1)}
              onFileDrop={handleLogoDrop}
              isLoading={isUploadingLogo}
              progress={logoProgress}
            />
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[11px] text-muted-foreground/50">atau</span>
              <LogoGenerator
                storeName={formData.name}
                primaryColor={formData.primaryColor}
                onGenerated={(url) => updateFormData('logo', url)}
                disabled={isUploadingLogo}
                onGenerateStateChange={handleGenerateStateChange}
              />
            </div>
          </>
        )}

        <p className="text-[11px] text-muted-foreground">{t('logoHelper')}</p>
      </div>

      {/* ── Background Image ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('bgHeading')}
          </p>
          <p className="text-xs text-muted-foreground">{t('bgDescription')}</p>
        </div>

        {formData.heroBackgroundImage ? (
          <div className="space-y-1.5">
            <FilledImageSlot
              url={formData.heroBackgroundImage}
              alt="Hero background"
              onRemove={onRemoveHeroBg}
              isRemoving={isRemovingHeroBg}
            />
            <div className="flex justify-center">
              <AspectBadge aspect={heroBgAspect ?? (formData.heroBackgroundImage ? 'landscape' : null)} />
            </div>
          </div>
        ) : (
          <EmptySlot
            index={0}
            label={t('bgUploadLabel')}
            onClick={() => openHeroBgFilePicker(1)}
            onFileDrop={handleHeroBgDrop}
            isLoading={isUploadingHeroBg}
            progress={heroBgProgress}
          />
        )}

        <p className="text-[11px] text-muted-foreground">{t('bgHelper')}</p>
      </div>

      {/* ── Brand Color ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('colorHeading')}
          </p>
          <p className="text-xs text-muted-foreground">{t('colorDescription')}</p>
        </div>
        <ColorPicker
          value={formData.primaryColor}
          onChange={(v) => updateFormData('primaryColor', v)}
        />
        {formData.primaryColor && (
          <p className="text-xs font-mono text-muted-foreground">{formData.primaryColor}</p>
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
