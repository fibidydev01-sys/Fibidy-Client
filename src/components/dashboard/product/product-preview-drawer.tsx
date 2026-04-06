'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Drawer } from 'vaul';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Tag, Calendar, Edit, Trash2, Eye, EyeOff, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/shared/utils';
import { formatPrice, formatDateShort } from '@/lib/shared/format';
import { getProductPricing } from '@/lib/shared/product-utils';
import type { Product } from '@/types/product';

interface ProductPreviewDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleActive?: (product: Product) => void;
}

// ─── Inner content — di-mount ulang setiap kali product berganti via key prop
// Ini menghilangkan kebutuhan reset state via useEffect sama sekali.
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
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerSentinelRef = useRef<HTMLDivElement>(null);

  // FIX: setIsHeaderSticky dipanggil dari IntersectionObserver callback —
  // bukan dari effect body langsung, tidak melanggar react-hooks/set-state-in-effect
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const sentinel = headerSentinelRef.current;
    if (!scrollContainer || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderSticky(!entry.isIntersecting);
      },
      { root: scrollContainer, threshold: 0, rootMargin: '-1px 0px 0px 0px' }
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
    if (onToggleActive) {
      onToggleActive(product);
    }
  }, [product, onToggleActive]);

  const hasImages = product.images && product.images.length > 0;
  const currentImage = hasImages ? product.images[selectedImageIndex] : null;
  const { isCustomPrice } = getProductPricing(product);

  return (
    <>
      <Drawer.Title asChild>
        <VisuallyHidden.Root>
          {product.name ? `Preview ${product.name}` : 'Product Preview'}
        </VisuallyHidden.Root>
      </Drawer.Title>
      <Drawer.Description asChild>
        <VisuallyHidden.Root id="drawer-description">
          {product.description || `View details for ${product.name || ''}`}
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
          isHeaderSticky && 'shadow-md'
        )}
      >
        <h2 className="font-semibold text-base text-center truncate">
          {product.name}
        </h2>
      </div>

      {/* Scrollable Content */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
        <div ref={headerSentinelRef} className="h-0" />

        {/* Gambar produk */}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground mt-2">No image</p>
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
                      'relative aspect-square rounded-lg overflow-hidden bg-muted',
                      'border-2',
                      selectedImageIndex === idx
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/20'
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

        {/* Konten detail */}
        <div className="px-4 pb-8 max-w-2xl mx-auto">

          {/* Harga */}
          {!isCustomPrice && (
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Deskripsi */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
              <p className="text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Grid detail */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {product.category && (
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium">{product.category}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium">{formatDateShort(product.createdAt)}</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Tombol aksi */}
          <div className="grid grid-cols-2 gap-3">
            {onToggleActive && (
              <Button variant="outline" className="w-full" onClick={handleToggleActive}>
                {product.isActive ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
            )}

            {onEdit && (
              <Button variant="default" className="w-full" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {onDelete && (
            <Button
              variant="outline"
              className="w-full mt-3 text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete product
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Outer shell — hanya pegang Drawer.Root + portal
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
            'flex flex-col'
          )}
          aria-describedby="drawer-description"
        >
          {/* KEY = product.id — React unmount + remount DrawerInner setiap ganti product.
              Semua state (selectedImageIndex, isHeaderSticky, scroll) reset otomatis via unmount.
              Zero useEffect setState, zero eslint-disable. */}
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