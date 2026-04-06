/**
 * ============================================================================
 * FILE: src/components/dashboard/shared/og-image.tsx
 * PURPOSE: Shared utilities for Open Graph image generation
 *          Dipakai di: app/store/[slug]/opengraph-image.tsx
 *                      app/store/[slug]/products/[id]/opengraph-image.tsx
 * ============================================================================
 */

import { ImageResponse } from 'next/og';

// ============================================================================
// API URL
// ============================================================================

/**
 * Get API URL - safe for both Edge and Node.js runtime
 * Supports: local dev, Vercel deployment, custom API URL
 */
export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api`;
  }
  return 'http://localhost:8000/api';
}

// ============================================================================
// IMAGE UTILS
// ============================================================================

/**
 * Optimize image URL for OG image rendering
 * Supports Cloudinary and Unsplash transformations
 */
export function optimizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
      return url.replace('/upload/', '/upload/w_600,h_600,c_limit,q_80,f_auto/');
    }
    if (url.includes('images.unsplash.com')) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('w', '600');
      urlObj.searchParams.set('h', '600');
      urlObj.searchParams.set('fit', 'crop');
      urlObj.searchParams.set('q', '80');
      urlObj.searchParams.set('auto', 'format');
      return urlObj.toString();
    }
    return url;
  } catch {
    return null;
  }
}

/**
 * Create a simple fallback ImageResponse when OG generation fails
 */
export function createFallbackImage(message: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          fontSize: '32px',
          color: '#9ca3af',
        }}
      >
        {message}
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

// ============================================================================
// STRING UTILS
// ============================================================================

/**
 * Get initials from a name string
 * e.g. "Toko Maju" → "TM"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}