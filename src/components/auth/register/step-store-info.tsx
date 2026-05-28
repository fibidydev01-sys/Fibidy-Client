'use client';

// ============================================================================
// STEP STORE INFO
// File: src/components/auth/register/step-store-info.tsx
//
// [SPRINT 5 — FIELD HIGHLIGHT]
// - Tambah props fieldErrors + onClearFieldError
// - Field name + slug highlight merah saat ada error
// - Merah hilang saat user mulai ketik
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Check, X, Info } from 'lucide-react';
import { cn } from '@/lib/shared/utils';

interface StepStoreInfoProps {
  name: string;
  slug: string;
  description: string;
  onUpdate: (data: { name?: string; slug?: string; description?: string }) => void;
  isChecking: boolean;
  isAvailable: boolean | null;
  // [SPRINT 5]
  fieldErrors?: Set<string>;
  onClearFieldError?: (field: string) => void;
}

export function StepStoreInfo({
  name,
  slug,
  description,
  onUpdate,
  isChecking,
  isAvailable,
  fieldErrors = new Set(),
  onClearFieldError,
}: StepStoreInfoProps) {
  const t = useTranslations('auth.register.storeInfo');
  const [hasManuallyEditedSlug, setHasManuallyEditedSlug] = useState(false);

  const hasNameError = fieldErrors.has('name');
  const hasSlugError = fieldErrors.has('slug');

  const handleNameChange = (value: string) => {
    if (hasNameError) onClearFieldError?.('name');
    if (!hasManuallyEditedSlug) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 30);
      onUpdate({ name: value, slug: generated });
    } else {
      onUpdate({ name: value });
    }
  };

  const handleSlugChange = (value: string) => {
    if (hasSlugError) onClearFieldError?.('slug');
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setHasManuallyEditedSlug(true);
    onUpdate({ slug: cleaned });
  };

  const handleDescriptionChange = (value: string) => {
    onUpdate({ description: value });
  };

  const nameTooShort = name.length > 0 && name.trim().length < 3;
  const slugTooShort = slug.length > 0 && slug.length < 3;
  const showAvailability = slug.length >= 3;

  return (
    <div className="space-y-5 max-w-md">

      {/* Store Name */}
      <div className="space-y-1.5">
        <Label
          htmlFor="store-name"
          className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground"
        >
          {t('nameLabel')}
        </Label>
        <Input
          id="store-name"
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className={cn(
            'h-11 text-base font-semibold tracking-tight placeholder:font-normal placeholder:text-muted-foreground/50',
            hasNameError && 'border-destructive focus-visible:ring-destructive',
          )}
        />
        {hasNameError ? (
          <p className="text-xs text-destructive font-medium">
            {t('nameRequired')}
          </p>
        ) : nameTooShort ? (
          <p className="text-xs text-muted-foreground">
            {t('nameMinLength')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t('nameHelper')}
          </p>
        )}
      </div>

      <div className="border-t max-w-md" />

      {/* Store URL / Slug */}
      <div className="space-y-1.5">
        <Label
          htmlFor="store-slug"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('slugLabel')}
        </Label>
        <div className="relative">
          <Input
            id="store-slug"
            placeholder={t('slugPlaceholder')}
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={cn(
              'h-11 text-sm font-medium placeholder:font-normal placeholder:text-muted-foreground/50',
              hasSlugError && 'border-destructive focus-visible:ring-destructive',
            )}
          />
          {showAvailability && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : isAvailable === true ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : isAvailable === false ? (
                <X className="h-4 w-4 text-red-500" />
              ) : null}
            </div>
          )}
        </div>

        {hasSlugError ? (
          <p className="text-xs text-destructive font-medium">
            {isAvailable === false ? t('slugTaken') : t('slugRequired')}
          </p>
        ) : slugTooShort ? (
          <p className="text-xs text-muted-foreground">
            {t('slugMinLength')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" />
            {t('slugSuffix', { slug: slug || t('slugDefault') })}
          </p>
        )}

        {isAvailable === false && !slugTooShort && !hasSlugError && (
          <p className="text-xs text-destructive">{t('slugTaken')}</p>
        )}
      </div>

      <div className="border-t max-w-md" />

      {/* Description */}
      <div className="space-y-1.5">
        <Label
          htmlFor="store-desc"
          className="text-[11px] font-medium tracking-widests uppercase text-muted-foreground"
        >
          {t('descriptionLabel')}{' '}
          <span className="normal-case font-normal text-muted-foreground/70">{t('descriptionOptional')}</span>
        </Label>
        <Textarea
          id="store-desc"
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          maxLength={500}
          className="resize-none text-sm placeholder:text-muted-foreground/50"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{t('descriptionHelper')}</span>
          <span className="font-mono tabular-nums">
            {t('descriptionCount', { current: description.length, max: 500 })}
          </span>
        </div>
      </div>
    </div>
  );
}
