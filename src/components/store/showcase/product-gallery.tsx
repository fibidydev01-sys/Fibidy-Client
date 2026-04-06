'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shared/utils';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const hasImages = images.length > 0;
  const hasMultipleImages = images.length > 1;
  const currentImage = hasImages ? images[selectedIndex] : null;

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

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
  }, [zoomOpen, hasMultipleImages]);

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {hasImages && currentImage ? (
          <>
            <OptimizedImage
              src={currentImage}
              alt={`${productName} — image ${selectedIndex + 1}`}
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
                {selectedIndex + 1} / {images.length}
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
                alt={`${productName} — thumbnail ${index + 1}`}
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
          {/* Backdrop — klik nutup */}
          <div
            className="fixed inset-0 z-50 bg-black/95"
            onClick={() => setZoomOpen(false)}
          />

          {/* Content — pointer-events-none biar klik tembus ke backdrop, kecuali elemen interaktif */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">

            {/* Image */}
            <div className="relative w-[90vw] h-[90vh]">
              {currentImage && (
                <OptimizedImage
                  src={currentImage}
                  alt={`${productName} — image ${selectedIndex + 1}`}
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
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}