'use client';

// ==========================================
// PRODUCT GALLERY
// File: src/components/store/showcase/product-gallery.tsx
//
// [TIDUR-NYENYAK v3 FIX]
// useEffect (keyboard handler for zoom modal) had stale refs to
// goToNext/goToPrevious because they weren't in the deps array
// (react-hooks/exhaustive-deps warning line 40).
//
// Fix: wrap goToPrevious/goToNext in useCallback so references are
// stable, then add them to the effect's deps array. Keyboard nav
// now always uses the latest callbacks.
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const t = useTranslations('store.product.detail');
  const tGallery = useTranslations('store.product.gallery');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const currentImage = hasImages ? images[selectedIndex] : null;

  // [v3 FIX] Wrapped in useCallback so refs are stable
  // across renders. Required for effect deps below.
  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    if (!zoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false);
      if (!hasMultipleImages) return;
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // [v3 FIX] Added goToNext + goToPrevious to deps
  }, [zoomOpen, hasMultipleImages, goToNext, goToPrevious]);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {hasImages && currentImage ? (
          <>
            <OptimizedImage
              src={currentImage}
              alt={t('imageAlt', { name: productName, index: selectedIndex + 1 })}
              fill
              crop="fill"
              gravity="auto"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />

            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4 rounded-full shadow-lg"
              onClick={() => setZoomOpen(true)}
              aria-label={tGallery('zoomButton')}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full shadow-lg"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                {t('imagePosition', { current: selectedIndex + 1, total: images.length })}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-24 w-24 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors',
                selectedIndex === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-muted-foreground/30'
              )}
            >
              <OptimizedImage
                src={image}
                alt={t('thumbAlt', { name: productName, index: index + 1 })}
                width={80}
                height={80}
                crop="fill"
                gravity="auto"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-screen zoom */}
      {zoomOpen && (
        <>
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 z-50 bg-black/95"
            onClick={() => setZoomOpen(false)}
          />

          {/* Content — pointer-events-none so clicks pass through to backdrop, except interactive elements */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">

            {/* Image */}
            <div className="relative w-[90vw] h-[90vh]">
              {currentImage && (
                <OptimizedImage
                  src={currentImage}
                  alt={t('imageAlt', { name: productName, index: selectedIndex + 1 })}
                  fill
                  crop="fit"
                  sizes="90vw"
                  className="object-contain"
                />
              )}
            </div>

            {/* Navigation */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white h-12 w-12"
                  onClick={goToPrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white h-12 w-12"
                  onClick={goToNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                {t('imagePosition', { current: selectedIndex + 1, total: images.length })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}