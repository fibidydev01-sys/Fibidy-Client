'use client';

// ─── Preview Product Sheet — v3 unified ────────────────────────────────────
// v5: Display file size in KB instead of MB
//
// [IDR MIGRATION FOLLOW-UP — May 2026] — Bug #21 fix
// Two changes to align this preview with the IDR migration:
//
//   1. Removed local `formatPrice` helper that produced `$X.XX` (USD).
//      Replaced with `formatPriceIDR` from `@/lib/shared/format`.
//      ProductForm only creates/edits IDR products via the upload pipeline,
//      so the preview can format prices unconditionally as Rupiah.
//
// No behavioral changes elsewhere.
//
// [PREVIEW IMAGE + STATUS + COVER GRID FIX — Aug 2026]
//
// Three fixes bundled together because they all touched the same
// render pass and were easiest to verify as one visual diff:
//
//   1. THUMBNAIL RACE CONDITION — the header thumbnail used a bare
//      next/image <Image>, not the shared <OptimizedImage> wrapper every
//      other product-image surface in the app uses (product-grid-card.tsx,
//      product-preview-drawer.tsx). Bare next/image has no loading skeleton
//      of its own here (no placeholder/blurDataURL was wired), so on a
//      cold cache the box rendered visually empty until the Cloudinary
//      fetch resolved — reads as "image didn't load, needs a second
//      click/reopen to appear" even though it was really just an
//      unskeletoned network wait. Swapped to OptimizedImage, which already
//      owns the skeleton-fade-in behavior (see optimized-image.tsx) — same
//      fix pattern product-preview-drawer.tsx already got.
//
//   2. STATUS SECTION REMOVED — this Sheet had its own read-only
//      "Visibility: Active/Inactive" row sourced from `formData.isActive`.
//      The live, single source of truth for that toggle is the
//      Activate/Deactivate pill in ProductPreviewDrawer's header
//      (product-preview-drawer.tsx) — that one is interactive and
//      optimistic; this one was a second, non-interactive readout of the
//      same fact rendered in a completely different place. Two displays of
//      one boolean, one of which can't be acted on from here, invites the
//      reading "this is a separate status from the other one" when it
//      isn't. Removed the whole PreviewSection so isActive has exactly one
//      place it's shown: the drawer header pill.
//
//   3. COVER IMAGES — was a single PreviewRow reading
//      "X photos uploaded" as plain text, no thumbnails. Replaced with an
//      actual thumbnail grid (reusing OptimizedImage per tile) so what the
//      seller is about to publish is visible here, not just counted.
//      This is a REVIEW surface, not the edit surface — StepMedia (the
//      actual Cover step) already owns drag-to-reorder via dnd-kit
//      (DndContext/SortableContext/useSortable — see step-media.tsx's
//      SortableImageSlot). Wiring another independent drag context into
//      this read-only summary would let the seller reorder from two
//      different places with two different interaction models converging
//      on the same form field, which is a race condition waiting to
//      happen, not a feature. Order shown here always mirrors
//      formData.images, which StepMedia is the only writer of.

import { useTranslations } from 'next-intl';
import { FileText, ImageIcon } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import type { ProductFormData } from '@/lib/shared/validations';
import { ringkasanDeskripsi } from '@/lib/shared/markdown';

interface PreviewProductProps {
  open: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  formData: ProductFormData;
  isEditing: boolean;
  /** Mirrors product.tsx's showFileStep — hides the File section instead of showing "No file yet". */
}

function PreviewSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function PreviewRow({
  label,
  value,
  valueClass,
  missing,
}: {
  label: string;
  value?: string | null;
  valueClass?: string;
  missing?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-border/40 last:border-0">
      <p className="text-xs text-muted-foreground shrink-0">{label}</p>
      {value ? (
        <p className={cn('text-xs font-medium text-right', valueClass)}>{value}</p>
      ) : (
        <p className="text-xs text-muted-foreground/40 italic">{missing ?? '—'}</p>
      )}
    </div>
  );
}

export function PreviewProduct({
  open,
  onClose,
  onSave,
  isSaving,
  formData,
  isEditing,
}: PreviewProductProps) {
  const t = useTranslations('dashboard.products.form.preview');
  const images = formData.images || [];
  const firstImage = images[0];

  // [IDR MIGRATION] Format helper — IDR Rupiah, integer (no decimals).
  // Was: `${val.toFixed(2)}` USD. Now: "Rp 50.000" via Intl.NumberFormat('id-ID').
  // formatPriceIDR returns "Rp 0" for 0/null/undefined input — guard for null
  // and 0 (which we treat as "not filled in" for the seller-facing preview).
  const formatPrice = (val?: number | null): string | null => {
    if (val == null || val === 0) return null;
    return formatPriceIDR(val);
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <SheetTitle className="text-base font-bold">
            {isEditing ? t('titleEdit') : t('titleNew')}
          </SheetTitle>
          <SheetDescription className="text-xs">
            {isEditing ? t('descriptionEdit') : t('descriptionNew')}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Thumbnail */}
          <div className="flex items-start gap-4">
            {/*
              [FIX 1 — THUMBNAIL RACE CONDITION]
              relative + fixed box is required here — OptimizedImage's
              `fill` mode expects a positioned ancestor to fill, same
              contract next/image's fill prop already had. Swapped bare
              next/image for OptimizedImage so this thumbnail gets the same
              skeleton-while-loading treatment product-grid-card.tsx and
              product-preview-drawer.tsx already have, instead of
              rendering an empty box until the Cloudinary fetch resolves.
            */}
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border bg-muted shrink-0">
              {firstImage ? (
                <OptimizedImage
                  src={firstImage}
                  alt={t('thumbnailAlt')}
                  fill
                  crop="fill"
                  gravity="auto"
                  sizes="80px"
                  className="object-cover"
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold leading-tight truncate mt-0.5">
                {formData.name || <span className="text-muted-foreground font-normal italic text-sm">{t('noName')}</span>}
              </p>
              {formData.category && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{formData.category}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <PreviewSection label={t('sectionDetails')}>
            <div className="rounded-xl border bg-card overflow-hidden px-3 py-1">
              <PreviewRow label={t('rowName')} value={formData.name} missing={t('notFilledIn')} />
              <PreviewRow label={t('rowCategory')} value={formData.category} missing={t('noCategory')} />
              <PreviewRow
                label={t('rowDescription')}
                // [MARKDOWN] Dilucuti DULU baru dipotong. Memotong markdown
                // mentah di karakter ke-60 bisa jatuh di tengah sintaks dan
                // menyisakan `**Ko…` di ringkasan.
                value={ringkasanDeskripsi(formData.description)}
                missing={t('noDescription')}
              />
            </div>
          </PreviewSection>

          {/*
            [FIX 3 — COVER IMAGES GRID]
            Was a single text row ("X photos uploaded"). Now an actual
            thumbnail strip so the seller can see what they're about to
            publish, not just a count. Read-only by design — see file-header
            note above for why drag-reorder intentionally does NOT live
            here (StepMedia already owns it as the single writer of
            formData.images' order).
          */}
          <PreviewSection label={t('sectionCoverImages')}>
            {images.length > 0 ? (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <div
                    key={img}
                    className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
                  >
                    <OptimizedImage
                      src={img}
                      alt={t('photoFallback', { index: idx + 1 })}
                      fill
                      crop="fill"
                      gravity="auto"
                      sizes="80px"
                      className="object-cover"
                      fallback={
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border bg-card px-3 py-1">
                <PreviewRow label={t('rowPhotos')} value={null} missing={t('noPhotos')} />
              </div>
            )}
          </PreviewSection>

          {/* Pricing */}
          <PreviewSection label={t('sectionPrice')}>
            <div className="rounded-xl border bg-card overflow-hidden px-3 py-1">
              <PreviewRow
                label={t('rowSellingPrice')}
                value={formatPrice(formData.price)}
                missing={t('notFilledIn')}
                valueClass="text-primary"
              />
              <PreviewRow
                label={t('rowComparePrice')}
                value={formatPrice(formData.comparePrice)}
                missing={t('dash')}
              />
            </div>
          </PreviewSection>

          {/*
            [FIX 2 — STATUS SECTION REMOVED]
            Previously rendered a read-only "Visibility: Active/Inactive"
            row here, sourced from formData.isActive. That's a second,
            non-interactive display of the same boolean the
            Activate/Deactivate pill in ProductPreviewDrawer's header
            already owns as the single source of truth — see file-header
            note above. isActive itself is untouched in formData and still
            gets sent on save (handleSave in product.tsx reads it
            unconditionally); only this redundant readout is gone.
          */}
        </div>

        <SheetFooter className="px-6 py-4 border-t bg-muted/30 shrink-0 flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            {t('backToEdit')}
          </Button>
          <Button className="flex-1" onClick={onSave} disabled={isSaving}>
            {isSaving
              ? (isEditing ? t('saving') : t('publishing'))
              : (isEditing ? t('saveChanges') : t('publishListing'))
            }
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}