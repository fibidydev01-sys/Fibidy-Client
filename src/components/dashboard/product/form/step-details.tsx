'use client';

// ==========================================
// PRODUCT FORM — Step: Details (Name + Price)
//
// [IDR MIGRATION — May 2026]
// Currency change: USD → IDR for product creation/editing.
// Three changes to the price inputs:
//
//   1. Prefix: <span>$</span> → <span>Rp</span>
//      Visual cue to seller that they're entering Rupiah.
//
//   2. step: "0.01" → "1000"
//      IDR has no fractional values. Step of 1000 also matches typical
//      pricing increments in Indonesian commerce (Rp 25.000, Rp 50.000,
//      Rp 75.000, etc).
//
//   3. min on price: "0" → "1000"
//      Matches BE DTO @Min(1000) and validation schema. Browsers
//      enforce HTML5 `min` for type="number" so this is a first line
//      of defense — Zod schema is the second.
//
//   4. comparePrice min stays "0" — optional field, allow zero/unset.
//
//   5. onChange: Number(e.target.value) → parseInt(e.target.value, 10)
//      Coerce to integer so we never accidentally feed a decimal value
//      into the IDR field. parseInt handles empty string → NaN, and we
//      fall back to 0 for the temporary form state.
//
// Localized labels and helpers come from messages/{en,id}/dashboard.json
// under `dashboard.products.form.*`.
// ==========================================

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProductFormData } from '@/lib/shared/validations';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';

interface StepDetailsProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
  watch: UseFormWatch<ProductFormData>;
  setValue: UseFormSetValue<ProductFormData>;
}

/**
 * Helper: parse number input as integer (Rupiah).
 * Returns 0 for empty/invalid input — Zod will catch the min-1000 violation
 * on submit; the temporary 0 just keeps form state consistent.
 */
function parseRupiahInput(value: string): number {
  if (value === '' || value == null) return 0;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

export function StepDetails({ register, errors, watch, setValue }: StepDetailsProps) {
  const t = useTranslations('dashboard.products.form');

  const price = watch('price') ?? 0;
  const comparePrice = watch('comparePrice');

  return (
    <div className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          {t('nameLabel')} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder={t('namePlaceholder')}
          {...register('name')}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
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

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">{t('categoryLabel')}</Label>
        <Input
          id="category"
          placeholder={t('categoryPlaceholder')}
          {...register('category')}
          aria-invalid={!!errors.category}
        />
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">
          {t('priceLabel')} <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          {/* [IDR MIGRATION] $ → Rp */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="price"
            type="number"
            inputMode="numeric"
            // [IDR MIGRATION] step 0.01 → 1000, min 0 → 1000
            step="1000"
            min="1000"
            placeholder={t('pricePlaceholder')}
            className="pl-9"
            value={price === 0 ? '' : price}
            onChange={(e) => setValue('price', parseRupiahInput(e.target.value), { shouldValidate: true })}
            aria-invalid={!!errors.price}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t('priceHelper')}</p>
        {errors.price && (
          <p className="text-sm text-destructive">{errors.price.message}</p>
        )}
      </div>

      {/* Compare price (optional) */}
      <div className="space-y-2">
        <Label htmlFor="comparePrice">{t('comparePriceLabel')}</Label>
        <div className="relative">
          {/* [IDR MIGRATION] $ → Rp */}
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            Rp
          </span>
          <Input
            id="comparePrice"
            type="number"
            inputMode="numeric"
            // [IDR MIGRATION] step 0.01 → 1000. min stays 0 (optional, allow unset).
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
