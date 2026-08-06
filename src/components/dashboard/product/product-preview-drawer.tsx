'use client';

// [TIDUR-NYENYAK FIX #9] Q3=A treatment:
// When product has purchases (salesCount > 0):
//   - HIDE "Delete product" button entirely
//   - Replace with info hint
//   - "Deactivate" button still works as normal (top action row)
//
// [i18n FIX — 2026-04-19]
// Replaced hardcoded fallback string `'FILE'` in the digital-product
// icon fallback block with a proper i18n key from `common.productType`.
// Previously: `{product.fileType?.toUpperCase() ?? 'FILE'}` would always
// render the English word "FILE" regardless of locale. Now uses
// `tProductType('fileFallback')` so it stays consistent with the rest
// of the product-type labels ("Digital", "Custom", etc.) and gets
// translated once new locales are added in Phase 2.
//
// [IDR MIGRATION FOLLOW-UP — May 2026] — Bug #22 fix
// Replaced hardcoded `${(product.price ?? 0).toFixed(2)}` and
// `${product.comparePrice.toFixed(2)}` with `formatPrice()` from
// `@/lib/shared/format`, defaulting currency to `'IDR'` to match the
// rest of the IDR migration. Was rendering "$50000.00" for IDR products
// — wrong on every dimension (symbol, separator, decimal rule).
// Now renders "Rp 50.000".
//
// `product.currency` carries the actual currency from BE; we fall back
// to 'IDR' for legacy/null values consistent with format.ts default.
//
// [UI/UX CONSISTENCY AUDIT]
// Rebuilt on top of the shared shadcn Drawer primitives (DrawerHeader /
// DrawerFooter from '@/components/ui/drawer') instead of raw vaul +
// a hand-rolled sticky-on-scroll IntersectionObserver. Header and footer
// now sit outside the scroll container as regular flex siblings, so they
// stay put by construction — only the middle section scrolls.

import { useState, useCallback } from 'react';
import Image from 'next/image';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useTranslations } from 'next-intl';
import {
  Tag,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ImageIcon,
  FileText,
  Download,
  Info,
} from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/shared/utils';
import {
  formatDateShort,
  formatFileSizeFromMb,
  formatPrice,
} from '@/lib/shared/format';
import type { Product } from '@/types/product';

interface ProductPreviewDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleActive?: (product: Product) => void;
}

interface DrawerInnerProps {
  product: Product;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleActive?: (product: Product) => void;
}

function DrawerInner({
  product,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleActive,
}: DrawerInnerProps) {
  const t = useTranslations('dashboard.products.previewDrawer');
  // [i18n FIX] For the "FILE" fallback label when fileType is null.
  const tProductType = useTranslations('common.productType');

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(product);
      onOpenChange(false);
    }
  }, [product, onEdit, onOpenChange]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(product);
      onOpenChange(false);
    }
  }, [product, onDelete, onOpenChange]);

  const handleToggleActive = useCallback(() => {
    if (onToggleActive) onToggleActive(product);
  }, [product, onToggleActive]);

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[selectedImageIndex] : null;
  const isDigital = !!product.fileKey;
  const salesCount = product._count?.purchases ?? 0;

  // [FIX #9] Delete is blocked if product has purchases.
  const canDelete = salesCount === 0;

  // [IDR MIGRATION] Default to IDR uniformly. Was: hardcoded $X.XX.
  // formatPrice respects locale + symbol + decimal rules per currency.
  const currency = product.currency ?? 'IDR';

  return (
    <>
      {/* Sticky header — outside the scroll container, so it never moves */}
      <DrawerHeader className="border-b shrink-0 gap-0">
        <DrawerTitle asChild>
          <VisuallyHidden.Root>
            {product.name ? t('title', { name: product.name }) : t('titleFallback')}
          </VisuallyHidden.Root>
        </DrawerTitle>
        <DrawerDescription asChild>
          <VisuallyHidden.Root id="drawer-description">
            {product.description || t('descriptionFallback', { name: product.name || '' })}
          </VisuallyHidden.Root>
        </DrawerDescription>
        <h2 className="font-semibold text-base text-center truncate">
          {product.name}
        </h2>
      </DrawerHeader>

      {/* Scrollable content — the only part that scrolls */}
      <div className="flex-1 overflow-y-auto">
        {/* Image / File icon */}
        <div className="px-4 py-6">
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-muted">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {isDigital ? (
                    <>
                      <FileText className="h-16 w-16 text-muted-foreground/30" />
                      <Badge variant="outline" className="text-xs">
                        {product.fileType?.toUpperCase() ?? tProductType('fileFallback')}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">{t('noImage')}</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      'relative aspect-square rounded-lg overflow-hidden bg-muted border-2',
                      selectedImageIndex === idx
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/20',
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="px-4 pb-8 max-w-2xl mx-auto">
          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              {/* [IDR MIGRATION] formatPrice — was: ${(price).toFixed(2)} */}
              <span className="text-2xl font-bold">
                {formatPrice(product.price ?? 0, currency)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.comparePrice, currency)}
                </span>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                {t('description')}
              </h3>
              <p className="text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4">
            {product.category && (
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('category')}</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">{t('created')}</p>
                <p className="text-sm font-medium">
                  {formatDateShort(product.createdAt)}
                </p>
              </div>
            </div>

            {isDigital && product.fileType && (
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('file')}</p>
                  <p className="text-sm font-medium">
                    {product.fileType.toUpperCase()}
                    {product.fileSizeMb
                      ? ` · ${formatFileSizeFromMb(product.fileSizeMb)}`
                      : ''}
                  </p>
                </div>
              </div>
            )}

            {salesCount > 0 && (
              <div className="flex items-start gap-3">
                <Download className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('sales')}</p>
                  <p className="text-sm font-medium">{t('salesCount', { count: salesCount })}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky footer — outside the scroll container, always reachable */}
      <DrawerFooter className="border-t">
        <div className="grid grid-cols-2 gap-3">
          {onToggleActive && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleToggleActive}
            >
              {product.isActive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  {t('deactivate')}
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {t('activate')}
                </>
              )}
            </Button>
          )}
          {onEdit && (
            <Button
              variant="default"
              className="w-full"
              onClick={handleEdit}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </Button>
          )}
        </div>

        {/* [FIX #9] Delete button — only shown if product has NO purchases */}
        {onDelete && canDelete && (
          <Button
            variant="outline"
            className="w-full text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('deleteProduct')}
          </Button>
        )}

        {/* [FIX #9] Info hint when product has purchases (delete blocked) */}
        {onDelete && !canDelete && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2.5">
            <div className="flex gap-2">
              <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                <p className="font-medium mb-0.5">
                  {t('cannotDeleteTitle')}
                </p>
                <p className="text-amber-700 dark:text-amber-400">
                  {t('cannotDeleteBody')}
                </p>
              </div>
            </div>
          </div>
        )}
      </DrawerFooter>
    </>
  );
}

export function ProductPreviewDrawer({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onToggleActive,
}: ProductPreviewDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="z-[60] max-h-[92vh]">
        {product && (
          <DrawerInner
            key={product.id}
            product={product}
            onOpenChange={onOpenChange}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}
