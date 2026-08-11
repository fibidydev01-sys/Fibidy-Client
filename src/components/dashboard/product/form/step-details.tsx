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
//
// [MAX-LENGTH GUARDRAIL — Aug 2026]
// name/description had a Zod max() (200 / 1000 chars) but nothing
// enforced it in the input itself — a seller could type past the limit,
// only find out on submit, and the description textarea had no visible
// signal of how much room was left. Two changes:
//   1. `maxLength` HTML attribute on both fields — hard-blocks typing
//      past the limit (matches the CreateProductDto backend caps:
//      name 200, description 1000). Paste beyond the limit is also
//      truncated by the browser, so the value can never exceed either
//      cap regardless of input method.
//   2. A live "used/max" counter under each field, right-aligned next
//      to the helper/error row so it doesn't add a new line of layout
//      most of the time. Turns amber past 90% of the limit and
//      destructive-red at the limit, using the same color tokens the
//      rest of this file already uses for field errors — no new colors
//      introduced.
// Category (max 100) intentionally left without a counter — it's a
// short single-word-ish combobox field where hitting 100 chars is not
// a realistic user path worth the visual noise; maxLength is applied
// there too as a silent backstop.
// ============================================================================

import { useState, useMemo, useRef } from 'react';
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
import { useKasirConfig } from '@/hooks/dashboard/use-kasir';
import type { ProductFormData } from '@/lib/shared/validations';
import type { UseFormReturn } from 'react-hook-form';

interface StepDetailsProps {
  form: UseFormReturn<ProductFormData>;
  categories?: string[];
  /**
   * [KASIR JASA] true saat mengedit produk yang sudah ada. Jenis
   * (barang/layanan) dikunci di mode ini karena server menolak
   * perubahannya — riwayat stok dan baris transaksi sudah terlanjur
   * mengasumsikan salah satunya.
   */
  isEditing?: boolean;
  /** [v7] Field keys yang punya error — untuk highlight + data-field-error */
  fieldErrors?: Set<string>;
  /** [v7] Callback saat field error di-clear (user mulai ketik) */
  onClearFieldError?: (field: string) => void;
}

// [MAX-LENGTH GUARDRAIL] Mirrors CreateProductDto's @MaxLength decorators
// (server/src/products/dto/create-product.dto.ts) — keep these two numbers
// in sync with the backend if that DTO ever changes.
const NAME_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;
const CATEGORY_MAX_LENGTH = 100;

function parseRupiahInput(value: string): number {
  if (value === '' || value == null) return 0;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? 0 : n;
}

/** [MAX-LENGTH GUARDRAIL] Small right-aligned "used/max" counter, shared
 *  by name + description. Color escalates as the field fills up so the
 *  seller gets a passive warning before they actually hit the wall. */
function CharCounter({ current, max }: { current: number; max: number }) {
  const ratio = max > 0 ? current / max : 0;
  return (
    <span
      className={cn(
        'text-xs tabular-nums shrink-0',
        ratio >= 1
          ? 'text-destructive font-medium'
          : ratio >= 0.9
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-muted-foreground/70',
      )}
    >
      {current}/{max}
    </span>
  );
}

export function StepDetails({
  form,
  categories = [],
  isEditing = false,
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
  const stok = watch('stok');
  const minStock = watch('minStock');
  const kind = watch('kind') ?? 'PRODUK';
  const isJasa = kind === 'JASA';

  // [G7] Mode dagang menentukan jenis apa yang masuk akal dibuat. Toko produk
  // murni yang membuat layanan akan menyimpannya dengan sukses lalu tidak
  // pernah menemukannya di tab Jual — katalog layanan memang tidak ditampilkan
  // untuk mode itu. Menawarkan pilihan yang berujung ke sana adalah jebakan,
  // jadi pilihannya disembunyikan DAN jalan keluarnya ditunjukkan.
  const { data: kasirConfig } = useKasirConfig();
  const dagangType = kasirConfig?.dagangType ?? 'PRODUK';
  const jenisTersedia =
    dagangType === 'HYBRID'
      ? (['PRODUK', 'JASA'] as const)
      : dagangType === 'JASA'
        ? (['JASA'] as const)
        : (['PRODUK'] as const);
  const jenisTerkunciModeDagang = jenisTersedia.length === 1;
  const durasiLabel = watch('durasiLabel');
  const durasiJam = watch('durasiJam');
  const selectedCategory = watch('category') ?? '';
  // [MAX-LENGTH GUARDRAIL] watch() drives the live counters below.
  const nameValue = watch('name') ?? '';
  const descriptionValue = watch('description') ?? '';

  // [ESLINT set-state-in-effect FIX — Aug 2026]
  // categoryQuery has two writers: (1) commitCategory below, whenever the
  // user picks/creates a category through the combobox, and (2) an
  // external reset of `selectedCategory` itself — e.g. edit/page.tsx
  // loading a *different* product into this same mounted form, where
  // `form.reset()` changes `category` without ever going through
  // commitCategory. (1) already calls setCategoryQuery directly at the
  // call site, so it needs no effect. (2) is what the old
  // `useEffect(() => setCategoryQuery(selectedCategory), [selectedCategory])`
  // existed for — but calling setState synchronously inside *any* effect
  // body trips `react-hooks/set-state-in-effect` regardless of the
  // reason, and use-products.ts's useKycReturnHandler() already
  // documents hitting this same rule and resolving it by removing the
  // effect-based setState entirely rather than suppressing the lint.
  //
  // Fix: React's own "adjust state during render" pattern
  // (react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes).
  // A ref tracks the last `selectedCategory` this component rendered
  // with; if the incoming prop differs from that ref *during render*
  // (not after, via effect), the query is corrected synchronously in the
  // same render pass and the ref updates immediately after — React
  // detects this same-render setState and re-renders before painting,
  // so there's no user-visible flash of the stale value, and no
  // cascading post-commit effect render either.
  const [categoryQuery, setCategoryQuery] = useState<string>(selectedCategory);
  const lastSelectedCategoryRef = useRef(selectedCategory);
  if (lastSelectedCategoryRef.current !== selectedCategory) {
    lastSelectedCategoryRef.current = selectedCategory;
    setCategoryQuery(selectedCategory);
  }

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
    const finalValue = value.trim().slice(0, CATEGORY_MAX_LENGTH);
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
          maxLength={NAME_MAX_LENGTH}
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
        {/* [MAX-LENGTH GUARDRAIL] Error text (if any) on the left, counter
            pinned right — counter always renders so the seller sees the
            ceiling before they ever get close to it. */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {hasNameError && (
              <p className="text-sm text-destructive font-medium">
                {t('nameRequired')}
              </p>
            )}
            {errors.name && !hasNameError && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <CharCounter current={nameValue.length} max={NAME_MAX_LENGTH} />
        </div>
      </div>

      {/* ── Description ───────────────────────────────────────────────── */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('descriptionLabel')}</Label>
        <Textarea
          id="description"
          placeholder={t('descriptionPlaceholder')}
          rows={4}
          maxLength={DESCRIPTION_MAX_LENGTH}
          {...register('description')}
          aria-invalid={!!errors.description}
        />
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>
          <CharCounter current={descriptionValue.length} max={DESCRIPTION_MAX_LENGTH} />
        </div>
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
            maxLength={CATEGORY_MAX_LENGTH}
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

      {/* ── [KASIR JASA] Jenis: barang atau layanan ────────────────────── */}
      {/*
        Ditaruh sebelum harga, bukan di bawah bersama stok, karena pilihan ini
        MENGUBAH ARTI field-field di bawahnya: barang punya stok, layanan
        punya durasi. Menaruhnya di bawah berarti seller mengisi dulu baru
        tahu sebagian isiannya tidak berlaku.
      */}
      <div className="space-y-2">
        <Label>{t('kindLabel')}</Label>

        {isEditing || jenisTerkunciModeDagang ? (
          // Dua sebab jenis tidak bisa dipilih, dengan keterangan berbeda:
          //   • sedang mengedit → jenis memang terkunci selamanya
          //   • mode dagang toko cuma mengizinkan satu jenis → bisa diubah,
          //     dan kalimatnya menyebutkan di mana
          <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
            <p className="text-sm font-medium">
              {(isEditing ? isJasa : jenisTersedia[0] === 'JASA')
                ? t('kindJasa')
                : t('kindBarang')}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEditing ? t('kindLockedHint') : t('kindModeHint')}
            </p>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {jenisTersedia.map((opsi) => {
              const aktif = kind === opsi;
              return (
                <button
                  key={opsi}
                  type="button"
                  onClick={() => setValue('kind', opsi, { shouldValidate: true })}
                  aria-pressed={aktif}
                  className={cn(
                    'rounded-xl border px-3 py-3 text-left transition-colors',
                    aktif
                      ? 'border-primary bg-primary/[0.06]'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <span className="block text-sm font-medium">
                    {opsi === 'JASA' ? t('kindJasa') : t('kindBarang')}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {opsi === 'JASA' ? t('kindJasaHint') : t('kindBarangHint')}
                  </span>
                </button>
              );
            })}
          </div>
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

      {/* ── [KASIR] Stok & stok minimum ───────────────────────────────── */}
      {/*
        Dua angka, dua arti berbeda, jadi dua field:
          stok     → berapa yang ada sekarang. Saat produk baru dibuat,
                     server mencatatnya sebagai "Stok awal produk" di log;
                     saat diubah lewat form edit, tercatat sebagai opname.
          minStock → ambang badge "SISA N" di kasir. Default server 5.
        Keduanya opsional — produk tetap bisa dibuat dengan stok 0, dan
        produk stok 0 tetap boleh dijual di kasir.
      */}
      {isJasa ? (
        // ── Durasi layanan ────────────────────────────────────────────
        // Keduanya opsional: ada layanan yang selesai saat itu juga (potong
        // rambut) dan tidak punya estimasi untuk disampaikan ke pelanggan.
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="durasiLabel">{t('durasiLabelLabel')}</Label>
            <Input
              id="durasiLabel"
              maxLength={50}
              placeholder={t('durasiLabelPlaceholder')}
              value={durasiLabel ?? ''}
              onChange={(e) =>
                setValue('durasiLabel', e.target.value || undefined, {
                  shouldValidate: true,
                })
              }
              aria-invalid={!!errors.durasiLabel}
            />
            <p className="text-xs text-muted-foreground">
              {t('durasiLabelHelper')}
            </p>
            {errors.durasiLabel && (
              <p className="text-sm text-destructive">
                {errors.durasiLabel.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="durasiJam">{t('durasiJamLabel')}</Label>
            <Input
              id="durasiJam"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="0"
              value={durasiJam === undefined || durasiJam === null ? '' : durasiJam}
              onChange={(e) => {
                const raw = e.target.value;
                setValue(
                  'durasiJam',
                  raw === ''
                    ? undefined
                    : Math.max(0, Math.trunc(Number(raw) || 0)),
                  { shouldValidate: true },
                );
              }}
              aria-invalid={!!errors.durasiJam}
            />
            <p className="text-xs text-muted-foreground">
              {t('durasiJamHelper')}
            </p>
            {errors.durasiJam && (
              <p className="text-sm text-destructive">
                {errors.durasiJam.message}
              </p>
            )}
          </div>
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stok">{t('stokLabel')}</Label>
          <Input
            id="stok"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="0"
            value={stok === undefined || stok === null ? '' : stok}
            onChange={(e) => {
              const raw = e.target.value;
              setValue(
                'stok',
                raw === '' ? undefined : Math.max(0, Math.trunc(Number(raw) || 0)),
                { shouldValidate: true },
              );
            }}
            aria-invalid={!!errors.stok}
          />
          <p className="text-xs text-muted-foreground">{t('stokHelper')}</p>
          {errors.stok && (
            <p className="text-sm text-destructive">{errors.stok.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="minStock">{t('minStockLabel')}</Label>
          <Input
            id="minStock"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="5"
            value={minStock === undefined || minStock === null ? '' : minStock}
            onChange={(e) => {
              const raw = e.target.value;
              setValue(
                'minStock',
                raw === '' ? undefined : Math.max(0, Math.trunc(Number(raw) || 0)),
                { shouldValidate: true },
              );
            }}
            aria-invalid={!!errors.minStock}
          />
          <p className="text-xs text-muted-foreground">{t('minStockHelper')}</p>
          {errors.minStock && (
            <p className="text-sm text-destructive">{errors.minStock.message}</p>
          )}
        </div>
      </div>
      )}

    </div>
  );
}