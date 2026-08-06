'use client';

// ============================================================================
// PRODUCT FORM — Step: Details
// File: src/components/dashboard/product/form/step-details.tsx
//
// [PRODUCTS v7 — May 2026]
// Tambah:
//   - fieldErrors?: Set<string> prop
//   - onClearFieldError?: (field: string) => void prop
//   - data-field-error="true" di wrapper name dan price
//   - Border merah + text error saat field error
//   - Error hilang saat user mulai ketik (onClearFieldError)
//
// Field keys: 'name', 'price'
//
// [COMBOBOX MIGRATION — May 2026] carry-forward
// [IDR MIGRATION — May 2026] carry-forward
// ============================================================================

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from '@/components/ui/combobox';
import { cn } from '@/lib/shared/utils';
import { FEATURES } from '@/lib/config/features';
import type { ProductFormData } from '@/lib/shared/validations';
import type { UseFormReturn } from 'react-hook-form';

interface StepDetailsProps {
  form: UseFormReturn<ProductFormData>;
  categories?: string[];
  /** [v7] Field keys yang punya error — untuk highlight + data-field-error */
  fieldErrors?: Set<string>;
  /** [v7] Callback saat field error di-clear (user mulai ketik) */
  onClearFieldError?: (field: string) => void;
}

function parseRupiahInput(value: string): number {
  if (value === '' || value == null) return 0;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function StepDetails({
  form,
  categories = [],
  fieldErrors = new Set(),
  onClearFieldError,
}: StepDetailsProps) {
  const t = useTranslations('dashboard.products.form.details');
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const price = watch('price') ?? 0;
  const comparePrice = watch('comparePrice');
  const selectedCategory = watch('category') ?? '';

  const [categoryQuery, setCategoryQuery] = useState<string>(selectedCategory);

  useEffect(() => {
    setCategoryQuery(selectedCategory);
  }, [selectedCategory]);

  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, categoryQuery]);

  const trimmedQuery = categoryQuery.trim();
  const showCreateOption =
    trimmedQuery.length > 0 &&
    !categories.some((c) => c.toLowerCase() === trimmedQuery.toLowerCase());

  const commitCategory = (value: string) => {
    const finalValue = value.trim();
    setValue('category', finalValue, { shouldValidate: true });
    setCategoryQuery(finalValue);
  };

  const hasNameError = fieldErrors.has('name');
  const hasPriceError = fieldErrors.has('price');

  return (
    <div className="space-y-6">

      {/* ── Name ──────────────────────────────────────────────────────── */}
      {/*
        [SCROLL FIX] data-field-error di wrapper name.
        scrollToFirstFieldError() scroll ke sini saat name kosong.
      */}
      <div
        className="space-y-2"
        data-field-error={hasNameError ? 'true' : undefined}
      >
        <Label htmlFor="name">
          {t('nameLabel')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder={t('namePlaceholder')}
          {...register('name', {
            onChange: () => {
              if (hasNameError) onClearFieldError?.('name');
            },
          })}
          aria-invalid={!!errors.name || hasNameError}
          className={cn(
            hasNameError && 'border-destructive focus-visible:ring-destructive',
          )}
        />
        {hasNameError && (
          <p className="text-sm text-destructive font-medium">
            {t('nameRequired')}
          </p>
        )}
        {errors.name && !hasNameError && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('descriptionLabel')}</Label>
        <Textarea
          id="description"
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          {...register('description')}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* ── Category ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="category">{t('categoryPlaceholder')}</Label>
        <Combobox
          items={filteredCategories}
          value={selectedCategory}
          onValueChange={(v) => commitCategory(typeof v === 'string' ? v : '')}
        >
          <ComboboxInput
            id="category"
            placeholder={t('categorySearchPlaceholder')}
            value={categoryQuery}
            onChange={(e) => setCategoryQuery(e.target.value)}
            aria-invalid={!!errors.category}
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxList>
              {filteredCategories.length > 0 && (
                <ComboboxGroup>
                  <ComboboxLabel>{t('categoryHeadingCategory')}</ComboboxLabel>
                  {filteredCategories.map((c) => (
                    <ComboboxItem key={c} value={c}>{c}</ComboboxItem>
                  ))}
                </ComboboxGroup>
              )}
              {showCreateOption && (
                <>
                  {filteredCategories.length > 0 && <ComboboxSeparator />}
                  <ComboboxGroup>
                    <ComboboxLabel>{t('categoryHeadingCreateNew')}</ComboboxLabel>
                    <ComboboxItem value={trimmedQuery} className="text-primary font-medium">
                      <Plus className="size-3.5 shrink-0" />
                      {t('categoryCreateOption', { query: trimmedQuery })}
                    </ComboboxItem>
                  </ComboboxGroup>
                </>
              )}
              {filteredCategories.length === 0 && !showCreateOption && (
                <ComboboxEmpty>{t('categoryHintEmpty')}</ComboboxEmpty>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* ── Price ─────────────────────────────────────────────────────── */}
      {/*
        [SCROLL FIX] data-field-error di wrapper price.
        scrollToFirstFieldError() scroll ke sini saat price kosong/invalid.
      */}
      <div
        className="space-y-2"
        data-field-error={hasPriceError ? 'true' : undefined}
      >
        <Label htmlFor="price">
          {t('priceLabel')} <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            step="1000"
            min="1000"
            placeholder={t('pricePlaceholder')}
            className={cn(
              'pl-9',
              hasPriceError && 'border-destructive focus-visible:ring-destructive',
            )}
            value={price === 0 ? '' : price}
            onChange={(e) => {
              setValue('price', parseRupiahInput(e.target.value), { shouldValidate: true });
              if (hasPriceError) onClearFieldError?.('price');
            }}
            aria-invalid={!!errors.price || hasPriceError}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {FEATURES.digitalProducts ? t('priceHelper') : t('priceHelperNoDigital')}
        </p>
        {hasPriceError && (
          <p className="text-sm text-destructive font-medium">
            {t('priceRequired')}
          </p>
        )}
        {errors.price && !hasPriceError && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
      </div>

      {/* ── Compare Price ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="comparePrice">{t('comparePriceLabel')}</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="comparePrice"
            type="number"
            inputMode="numeric"
            step="1000"
            min="0"
            placeholder={t('comparePricePlaceholder')}
            className="pl-9"
            value={!comparePrice ? '' : comparePrice}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                setValue('comparePrice', undefined, { shouldValidate: true });
              } else {
                setValue('comparePrice', parseRupiahInput(raw), { shouldValidate: true });
              }
            }}
            aria-invalid={!!errors.comparePrice}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('comparePriceHelper')}</p>
        {errors.comparePrice && (
          <p className="text-sm text-destructive">{errors.comparePrice.message}</p>
        )}
      </div>

    </div>
  );
}
