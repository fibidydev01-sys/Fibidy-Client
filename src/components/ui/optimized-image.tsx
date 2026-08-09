'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';

// Base64 blur placeholder
const BLUR_DATA_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3C/svg%3E";

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '';

function getImageType(src: string | undefined | null): { type: 'cloudinary' | 'external' | 'none'; src: string } {
  if (!src) return { type: 'none', src: '' };
  if (
    src.startsWith('http://res.cloudinary.com') ||
    src.startsWith('https://res.cloudinary.com') ||
    (!src.startsWith('http') && !src.startsWith('/') && CLOUDINARY_CLOUD_NAME)
  ) {
    return { type: 'cloudinary', src };
  }
  return { type: 'external', src };
}

interface OptimizedImageProps {
  src: string | undefined | null;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  crop?: 'fill' | 'fit' | 'thumb' | 'scale' | 'limit';
  gravity?: 'auto' | 'face' | 'faces' | 'center';
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  fallback?: React.ReactNode;
  /**
   * [LOADING SKELETON — Aug 2026]
   * Show a Skeleton overlay while the image is fetching/decoding, instead
   * of a blank/empty box. Defaults to true. Set false for cases where a
   * skeleton would be visually redundant (e.g. tiny icons, or a parent
   * that already renders its own loading state around this image).
   */
  showLoadingSkeleton?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  className,
  crop = 'fill',
  gravity = 'auto',
  priority = false,
  loading,
  fetchPriority,
  fallback,
  showLoadingSkeleton = true,
}: OptimizedImageProps) {
  const { type, src: imageSrc } = getImageType(src);

  // [LOADING SKELETON — Aug 2026]
  // Tracks whether THIS src has finished loading. Keyed by resetting on
  // src change (see effect below) so switching images — e.g. clicking a
  // different thumbnail in the product preview drawer — shows a fresh
  // skeleton for the new image instead of incorrectly reusing the
  // "loaded" state from the previous one.
  //
  // Starts `true` (loading) whenever there's an image to show. If the
  // browser already has it cached (warm cache — the "close and reopen"
  // case from the original bug report), onLoad fires essentially
  // synchronously on mount and the skeleton disappears immediately with
  // no visible flash. Cold cache (first load / hard refresh) is exactly
  // the case that was previously showing an empty box while the
  // Cloudinary URL was still in flight — now covered by the skeleton
  // instead.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [imageSrc]);

  const handleLoad = () => setIsLoading(false);
  // If the image fails outright, don't leave the skeleton spinning
  // forever — drop it so at least the alt text / broken-image state is
  // visible rather than an endless loading box.
  const handleError = () => setIsLoading(false);

  if (type === 'none' || !imageSrc) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  const skeletonOverlay = showLoadingSkeleton && isLoading && (
    <Skeleton
      className={cn(
        'absolute inset-0 transition-opacity duration-300',
        fill ? 'h-full w-full' : '',
      )}
      style={!fill && width && height ? { width, height } : undefined}
      aria-hidden="true"
    />
  );

  // Non-fill mode needs a positioning wrapper for the absolute skeleton to
  // anchor against — fill mode's parent is already expected to be
  // `relative` (that's the existing contract for next/image `fill`).
  const wrapperClassName = fill ? 'contents' : 'relative inline-block';

  if (type === 'cloudinary') {
    return (
      <span className={wrapperClassName}>
        {skeletonOverlay}
        <CldImage
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          crop={crop}
          gravity={gravity}
          className={cn(
            className,
            showLoadingSkeleton && 'transition-opacity duration-300',
            showLoadingSkeleton && isLoading && 'opacity-0',
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...(priority ? { loading: 'eager' as const, fetchPriority: 'high' as const } : {})}
          {...(loading ? { loading } : {})}
          {...(fetchPriority ? { fetchPriority } : {})}
        />
      </span>
    );
  }

  return (
    <span className={wrapperClassName}>
      {skeletonOverlay}
      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        className={cn(
          className,
          showLoadingSkeleton && 'transition-opacity duration-300',
          showLoadingSkeleton && isLoading && 'opacity-0',
        )}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        onLoad={handleLoad}
        onError={handleError}
        {...(priority ? { priority: true } : {})}
        {...(loading ? { loading } : {})}
      />
    </span>
  );
}