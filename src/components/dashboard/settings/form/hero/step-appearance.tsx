'use client';

import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/shared/utils';
import { useCloudinaryUpload } from '@/hooks/shared/use-cloudinary-upload';
import { EmptySlot } from '@/components/dashboard/shared/image-slot';
import { THEME_COLORS } from '@/lib/constants/shared/theme-colors';
import type { HeroFormData } from '@/types/tenant';

interface StepAppearanceProps {
  formData: HeroFormData;
  updateFormData: <K extends keyof HeroFormData>(key: K, value: HeroFormData[K]) => void;
  onRemoveHeroBg: () => void;
  isRemovingHeroBg: boolean;
  onRemoveLogo: () => void;
  isRemovingLogo: boolean;
}

function AppearanceFilledSlot({
  url,
  onRemove,
  isRemoving,
}: {
  url: string;
  onRemove: () => void;
  isRemoving: boolean;
}) {
  return (
    <div className="relative aspect-square w-full rounded-xl overflow-hidden border bg-muted group">
      <Image
        src={url}
        alt="Upload preview"
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

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (

    <div className="flex items-center justify-center gap-2">
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
              active && 'ring-2 ring-offset-2 ring-offset-background'
            )}
            style={active ? { ['--tw-ring-color' as string]: color.value } : undefined}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-transform',
                color.class,
                active && 'scale-105'
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

export function StepAppearance({
  formData,
  updateFormData,
  onRemoveHeroBg,
  isRemovingHeroBg,
  onRemoveLogo,
  isRemovingLogo,
}: StepAppearanceProps) {
  const { isUploading: isUploadingLogo, openWidget: openLogoWidget } = useCloudinaryUpload({
    folder: 'fibidy/logos',
    maxFiles: 1,
    onSuccess: (url) => updateFormData('logo', url),
  });

  const { isUploading: isUploadingHeroBg, openWidget: openHeroBgWidget } = useCloudinaryUpload({
    folder: 'fibidy/hero-backgrounds',
    maxFiles: 1,
    onSuccess: (url) => updateFormData('heroBackgroundImage', url),
  });

  return (
    <div className="space-y-8 max-w-sm mx-auto text-center">

      {/* Logo */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Logo
          </p>
          <p className="text-xs text-muted-foreground">
            Your store logo shown on the hero section
          </p>
        </div>
        {formData.logo ? (
          <AppearanceFilledSlot
            url={formData.logo}
            onRemove={onRemoveLogo}
            isRemoving={isRemovingLogo}
          />
        ) : (
          <EmptySlot
            index={0}
            label="Upload logo"
            onClick={() => openLogoWidget(1)}
            isLoading={isUploadingLogo}
          />
        )}
        <p className="text-[11px] text-muted-foreground">
          PNG/JPG · 200×200px · Transparent PNG recommended
        </p>
      </div>

      {/* Background Image */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Background Image
          </p>
          <p className="text-xs text-muted-foreground">
            Cover image for your store&#39;s hero banner
          </p>
        </div>
        {formData.heroBackgroundImage ? (
          <AppearanceFilledSlot
            url={formData.heroBackgroundImage}
            onRemove={onRemoveHeroBg}
            isRemoving={isRemovingHeroBg}
          />
        ) : (
          <EmptySlot
            index={0}
            label="Upload background"
            onClick={() => openHeroBgWidget(1)}
            isLoading={isUploadingHeroBg}
          />
        )}
        <p className="text-[11px] text-muted-foreground">
          Square 1:1 · min 1080×1080px · JPG/PNG
        </p>
      </div>

      {/* Brand Color */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <p className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Brand Color
          </p>
          <p className="text-xs text-muted-foreground">
            Primary color for buttons &amp; accents
          </p>
        </div>
        <ColorPicker
          value={formData.primaryColor}
          onChange={(v) => updateFormData('primaryColor', v)}
        />
      </div>

    </div>
  );
}