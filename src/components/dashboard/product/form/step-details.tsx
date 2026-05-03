'use client';

// ==========================================
// PRODUCT FORM — Step: Details (Name + Price + Category + Description)
//
// [PROPS PARITY FIX — May 2026]
// Previously this component declared:
//
//   interface StepDetailsProps {
//     register: UseFormRegister<ProductFormData>;
//     errors: FieldErrors<ProductFormData>;
//     watch: UseFormWatch<ProductFormData>;
//     setValue: UseFormSetValue<ProductFormData>;
//   }
//
// But the parent (product.tsx) renders it as:
//
//   <StepDetails form={form} categories={categories} />
//
// At runtime that meant `register` was `undefined`, so calling
// `register('name')` blew up with a TypeError on the very first
// render — surfacing as the "Application error: a client-side
// exception has occurred" message on /dashboard/products/new.
//
// Sibling steps (StepUpload, StepMedia) already use the
// `form: UseFormReturn<ProductFormData>` shape, so this file now
// matches that convention. We destructure the four hooks we need
// inside the component body.
//
// `categories` is accepted as an optional prop and wired into a
// native <datalist> for typeahead — useful for sellers who already
// have a few categories saved. Falls back to free-text entry when
// no categories are provided.
//
// [IDR MIGRATION — May 2026]
// Currency change: USD → IDR for product creation/editing.
// Three changes to the price inputs:
//
//   1. Prefix: <span>$</span> → <span>Rp</span>
//   2. step: "0.01" → "1000"  (IDR has no fractional values)
//   3. min on price: "0" → "1000"  (matches BE DTO @Min(1000))
//   4. comparePrice min stays "0" — optional, allow zero/unset.
//   5. onChange uses parseInt(value, 10) so we never feed a decimal
//      into the IDR field.
//
// [I18N FIX — May 2026]
// Translations are read from `dashboard.products.form.details` (not
// `dashboard.products.form`). The labels — `nameLabel`, `pricePlaceholder`
// etc. — live under the `.details` sub-namespace in the JSON. Reading
// from the parent namespace would resolve to undefined keys and throw
// MISSING_MESSAGE in production, contributing to the same client-side
// error symptom as the props mismatch above.
// ==========================================

import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProductFormData } from '@/lib/shared/validations';
import type { UseFormReturn } from 'react-hook-form';

interface StepDetailsProps {
  form: UseFormReturn<ProductFormData>;
  /** Existing seller categories — used to populate a typeahead datalist. */
  categories?: string[];
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

export function StepDetails({ form, categories = [] }: StepDetailsProps) {
  const t = useTranslations('dashboard.products.form.details');
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const datalistId = useId();
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

      {/* Category — free text with optional typeahead from existing categories */}
      <div className="space-y-2">
        <Label htmlFor="category">{t('categoryPlaceholder')}</Label>
        <Input
          id="category"
          placeholder={t('categoryPlaceholder')}
          list={categories.length > 0 ? datalistId : undefined}
          {...register('category')}
          aria-invalid={!!errors.category}
        />
        {categories.length > 0 && (
          <datalist id={datalistId}>
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        )}
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
            onChange={(e) =>
              setValue('price', parseRupiahInput(e.target.value), {
                shouldValidate: true,
              })
            }
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
                setValue('comparePrice', parseRupiahInput(raw), {
                  shouldValidate: true,
                });
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
