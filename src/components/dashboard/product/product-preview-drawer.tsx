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

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Drawer } from 'vaul';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/shared/utils';
import { formatDateShort, formatFileSizeFromMb } from '@/lib/shared/format';
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

  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const sentinel = headerSentinelRef.current;
    if (!scrollContainer || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsHeaderSticky(!entry.isIntersecting),
      { root: scrollContainer, threshold: 0, rootMargin: '-1px 0px 0px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

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

  return (
    <>
      <Drawer.Title asChild>
        <VisuallyHidden.Root>
          {product.name ? t('title', { name: product.name }) : t('titleFallback')}
        </VisuallyHidden.Root>
      </Drawer.Title>
      <Drawer.Description asChild>
        <VisuallyHidden.Root id="drawer-description">
          {product.description || t('descriptionFallback', { name: product.name || '' })}
        </VisuallyHidden.Root>
      </Drawer.Description>

      <div className="flex justify-center pt-3 pb-2 shrink-0">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Sticky Header */}
      <div
        className={cn(
          'px-4 pb-4 border-b shrink-0 transition-shadow duration-200',
          'sticky top-0 bg-background z-10',
          isHeaderSticky && 'shadow-md',
        )}
      >
        <h2 className="font-semibold text-base text-center truncate">
          {product.name}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div ref={headerSentinelRef} className="h-0" />

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
              <span className="text-2xl font-bold">
                ${(product.price ?? 0).toFixed(2)}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.comparePrice.toFixed(2)}
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
          <div className="grid grid-cols-2 gap-4 mb-6">
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

          <Separator className="my-6" />

          {/* Action buttons */}
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
              className="w-full mt-3 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('deleteProduct')}
            </Button>
          )}

          {/* [FIX #9] Info hint when product has purchases (delete blocked) */}
          {onDelete && !canDelete && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-3 py-2.5">
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
        </div>
      </div>
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
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-[9999]" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-[10000]',
            'bg-background rounded-t-[20px]',
            'max-h-[92vh] outline-none',
            'flex flex-col',
          )}
          aria-describedby="drawer-description"
        >
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
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}