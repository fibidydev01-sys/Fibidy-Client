'use client';

// ============================================================================
// STEP VISUAL — Setup Wizard Step 1
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/step-visual.tsx
//
// Fields: logo (required), primaryColor (required), heroBackgroundImage (required)
//
// [PHASE C — May 2026]
// Added LogoGenerator fallback button below logo upload slot.
// If seller doesn't have a logo file, they can click "Generate from store name"
// → initials SVG with primaryColor background → uploaded to Cloudinary.
//
// [Phase B] isAutofilled prop — renders AutofillBadge under label
// for primaryColor and heroBackgroundImage.
// ============================================================================

import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { EmptySlot } from '@/components/dashboard/shared/image-slot';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import { AutofillBadge } from './autofill-badge';
import { LogoGenerator } from './logo-generator';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StepVisualProps {
  logo: string;
  primaryColor: string;
  heroBackgroundImage: string;
  /** [PHASE C] Used by LogoGenerator to derive initials */
  storeName: string;
  onLogoChange: (url: string) => void;
  onColorChange: (hex: string) => void;
  onHeroBgChange: (url: string) => void;
  isAutofilled: (field: string) => boolean;
}

// ─── Filled Image Slot ────────────────────────────────────────────────────────

function FilledImageSlot({
  url,
  alt,
  onRemove,
  isRemoving = false,
}: {
  url: string;
  alt: string;
  onRemove: () => void;
  isRemoving?: boolean;
}) {
  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted group">
      <Image
        src={url}
        alt={alt}
        fill
        className="object-cover pointer-events-none"
        sizes="384px"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors" />
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onRemove}
          disabled={isRemoving}
          className="p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
        >
          {isRemoving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────

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
            style={
              active
                ? ({ '--tw-ring-color': color.value } as React.CSSProperties)
                : undefined
            }
          >
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-transform',
                color.class,
                active && 'scale-105',
              )}
            >
              {active && (
                <svg
                  className="w-3.5 h-3.5 text-white drop-shadow-sm"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
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
}: StepVisualProps) {
  const t = useTranslations('dashboard.setupStore.seller.visual');

  const { isUploading: isUploadingLogo, openWidget: openLogoWidget } =
    useCloudinaryUpload({
      folder: 'fibidy/logos',
      maxFiles: 1,
      onSuccess: (url) => onLogoChange(url),
    });

  const { isUploading: isUploadingHeroBg, openWidget: openHeroBgWidget } =
    useCloudinaryUpload({
      folder: 'fibidy/hero-backgrounds',
      maxFiles: 1,
      onSuccess: (url) => onHeroBgChange(url),
    });

  return (
    <div className="space-y-10 max-w-sm mx-auto text-center">

      {/* Logo — REQUIRED — skip list, no badge */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('logoLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </p>
          <p className="text-xs text-muted-foreground">{t('logoHelper')}</p>
        </div>
        {logo ? (
          <FilledImageSlot
            url={logo}
            alt="Store logo"
            onRemove={() => onLogoChange('')}
          />
        ) : (
          <>
            <EmptySlot
              index={0}
              label={t('uploadLogo')}
              onClick={() => openLogoWidget(1)}
              isLoading={isUploadingLogo}
            />
            {/* [PHASE C] Logo generator fallback */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-[11px] text-muted-foreground/50">
                {t('logoGenerateOr')}
              </span>
              <LogoGenerator
                storeName={storeName}
                primaryColor={primaryColor}
                onGenerated={onLogoChange}
                disabled={isUploadingLogo}
              />
            </div>
          </>
        )}
      </div>

      {/* Brand Color — REQUIRED — autofillable */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('colorLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </p>
          <AutofillBadge visible={isAutofilled('primaryColor')} />
          <p className="text-xs text-muted-foreground">{t('colorHelper')}</p>
        </div>
        <ColorPicker value={primaryColor} onChange={onColorChange} />
        {primaryColor && (
          <p className="text-xs font-mono text-muted-foreground">{primaryColor}</p>
        )}
      </div>

      {/* Hero Background — REQUIRED — autofillable */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            {t('heroBgLabel')}{' '}
            <span className="text-destructive normal-case font-normal">*</span>
          </p>
          <AutofillBadge visible={isAutofilled('heroBackgroundImage')} />
          <p className="text-xs text-muted-foreground">{t('heroBgHelper')}</p>
        </div>
        {heroBackgroundImage ? (
          <FilledImageSlot
            url={heroBackgroundImage}
            alt="Hero background"
            onRemove={() => onHeroBgChange('')}
          />
        ) : (
          <EmptySlot
            index={0}
            label={t('uploadHeroBg')}
            onClick={() => openHeroBgWidget(1)}
            isLoading={isUploadingHeroBg}
          />
        )}
      </div>

    </div>
  );
}
