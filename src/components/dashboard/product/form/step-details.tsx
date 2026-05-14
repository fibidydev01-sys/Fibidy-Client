'use client';

// ==========================================
// PRODUCT FORM — Step: Details (Name + Price + Category + Description)
//
// [COMBOBOX MIGRATION — May 2026]
// Category field migrated from <input> + <datalist> to Base UI Combobox.
// Behavior:
//   - Combobox lists all existing seller categories from
//     useProductCategories() (passed via props as `categories`).
//   - User types in the input → list filters live.
//   - If the typed query doesn't match any existing category, a
//     "Buat 'XYZ'" item appears at the bottom of the list.
//   - Clicking that item sets the form value to the typed string.
//   - On product save, the new category persists automatically — it's
//     just the `category` string field on Product. No separate API.
//     useCreateProduct / useUpdateProduct / useUploadProduct already
//     invalidate `queryKeys.products.categories()` so the next form
//     open shows the new category in the list.
//
// [Base UI Combobox API notes]
// The combobox.tsx in this repo uses @base-ui/react's Combobox primitive.
// Key shape:
//   - <Combobox> = Combobox.Root, accepts `items`, `value`, `onValueChange`.
//   - <ComboboxInput> is the input the user types in (also opens popup).
//   - <ComboboxContent> wraps the popup positioner + portal.
//   - <ComboboxList> is the scrollable list.
//   - <ComboboxItem> is each option; clicking commits via onValueChange.
//
// We do filtering ourselves (not via Combobox.Root's items collection)
// so we can append the "Create new" option dynamically.
//
// [PROPS PARITY — May 2026]
// Uses `form: UseFormReturn<ProductFormData>` shape, sibling step parity.
//
// [IDR MIGRATION — May 2026]
// Price inputs: Rp prefix, step="1000", min="1000"/min="0", integer parse.
//
// [I18N]
// Translations from `dashboard.products.form.details`. Keys used (all
// exist in dashboard.json en + id):
//   - nameLabel, namePlaceholder
//   - descriptionLabel, descriptionPlaceholder
//   - categoryPlaceholder, categorySearchPlaceholder
//   - categoryNoMatch, categoryCreateOption, categoryHintEmpty
//   - categoryHeadingCategory, categoryHeadingCreateNew
//   - priceLabel, pricePlaceholder, priceHelper
//   - comparePriceLabel, comparePricePlaceholder, comparePriceHelper
// ==========================================

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
import type { ProductFormData } from '@/lib/shared/validations';
import type { UseFormReturn } from 'react-hook-form';

interface StepDetailsProps {
  form: UseFormReturn<ProductFormData>;
  /** Existing seller categories — populates the combobox list. */
  categories?: string[];
}

/**
 * Parse number input as integer Rupiah.
 * Returns 0 for empty/invalid input — Zod catches the min-1000 violation
 * on submit; the temporary 0 keeps form state consistent until then.
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

  const price = watch('price') ?? 0;
  const comparePrice = watch('comparePrice');
  const selectedCategory = watch('category') ?? '';

  // Local search query — drives filter + "create new" affordance.
  // Initialize from current form value so the input reflects existing data
  // when entering the form (e.g. on edit page).
  const [categoryQuery, setCategoryQuery] = useState<string>(selectedCategory);

  // Sync local query when form value changes externally (e.g. form reset
  // or programmatic setValue from another source). Without this, the input
  // would drift from form state on edit-page load if categories list arrives
  // after the form's defaultValues are applied.
  useEffect(() => {
    setCategoryQuery(selectedCategory);
  }, [selectedCategory]);

  // Case-insensitive filter
  const filteredCategories = useMemo(() => {
    const q = categoryQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.toLowerCase().includes(q));
  }, [categories, categoryQuery]);

  // Show "Buat 'XYZ'" option when query is non-empty AND doesn't
  // exactly match any existing category (case-insensitive).
  const trimmedQuery = categoryQuery.trim();
  const showCreateOption =
    trimmedQuery.length > 0 &&
    !categories.some((c) => c.toLowerCase() === trimmedQuery.toLowerCase());

  // Commit a category selection to form state.
  const commitCategory = (value: string) => {
    const finalValue = value.trim();
    setValue('category', finalValue, { shouldValidate: true });
    setCategoryQuery(finalValue);
  };

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

      {/* Category — Combobox with "create on the fly" */}
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
              {/* Existing categories group */}
              {filteredCategories.length > 0 && (
                <ComboboxGroup>
                  <ComboboxLabel>{t('categoryHeadingCategory')}</ComboboxLabel>
                  {filteredCategories.map((c) => (
                    <ComboboxItem key={c} value={c}>
                      {c}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              )}

              {/* "Buat 'XYZ'" — only when query doesn't match anything */}
              {showCreateOption && (
                <>
                  {filteredCategories.length > 0 && <ComboboxSeparator />}
                  <ComboboxGroup>
                    <ComboboxLabel>{t('categoryHeadingCreateNew')}</ComboboxLabel>
                    <ComboboxItem
                      value={trimmedQuery}
                      className="text-primary font-medium"
                    >
                      <Plus className="size-3.5 shrink-0" />
                      {t('categoryCreateOption', { query: trimmedQuery })}
                    </ComboboxItem>
                  </ComboboxGroup>
                </>
              )}

              {/* Empty state — completely empty (no categories AND no query) */}
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

      {/* Price */}
      <div className="space-y-2">
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
