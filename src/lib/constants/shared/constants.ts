// ============================================================================
// SHARED CONSTANTS
// File: src/lib/constants/shared/constants.ts
//
// [SPRINT 4 — E1 FIX: NEXT_PUBLIC_ROOT_DOMAIN vs NEXT_PUBLIC_APP_URL drift]
// Sebelumnya dua env vars berbeda untuk nilai yang sama:
//   - proxy.ts     pakai: NEXT_PUBLIC_ROOT_DOMAIN  || 'fibidy.com'
//   - site.ts      pakai: NEXT_PUBLIC_APP_URL       || 'https://fibidy.com'
//
// Masalah: jika hanya satu yang di-set, keduanya bisa menunjuk domain berbeda.
// Contoh: NEXT_PUBLIC_APP_URL='https://staging.fibidy.com' tapi
//         NEXT_PUBLIC_ROOT_DOMAIN tidak di-set → proxy masih pakai 'fibidy.com'.
//
// Fix: derive ROOT_DOMAIN dari APP_URL jika NEXT_PUBLIC_ROOT_DOMAIN tidak di-set.
// Satu env var sebagai source of truth: NEXT_PUBLIC_APP_URL.
//
// Priority:
//   1. NEXT_PUBLIC_ROOT_DOMAIN (explicit override — untuk kasus khusus)
//   2. Derived dari NEXT_PUBLIC_APP_URL (strip protocol + www)
//   3. Hardcode fallback 'fibidy.com'
//
// [BUILD FIX — May 2026]
// Tambah GRID_COLS dan TOTAL_SLOTS yang dipakai oleh:
//   - src/components/store/product/product-grid.tsx   → GRID_COLS
//   - src/components/dashboard/product/form/step-media.tsx → TOTAL_SLOTS
// ============================================================================

/** Base URL API backend */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Full app URL dengan protocol.
 * Source of truth untuk absolute URL generation (OG image, canonical, dll).
 *
 * @example 'https://fibidy.com' | 'https://staging.fibidy.com'
 */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://fibidy.com';

/**
 * [E1 FIX] Root domain tanpa protocol — dipakai oleh proxy.ts untuk
 * subdomain detection dan routing.
 *
 * Derive dari NEXT_PUBLIC_ROOT_DOMAIN jika tersedia (explicit override),
 * otherwise extract dari NEXT_PUBLIC_APP_URL untuk konsistensi.
 *
 * @example 'fibidy.com' | 'staging.fibidy.com'
 */
function deriveRootDomain(): string {
  // Priority 1: explicit env var
  if (process.env.NEXT_PUBLIC_ROOT_DOMAIN) {
    return process.env.NEXT_PUBLIC_ROOT_DOMAIN;
  }

  // Priority 2: derive dari APP_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      const url = new URL(appUrl);
      // Strip 'www.' prefix jika ada
      return url.hostname.replace(/^www\./, '');
    } catch {
      // URL parsing failed — fallback
    }
  }

  // Priority 3: hardcode fallback
  return 'fibidy.com';
}

export const ROOT_DOMAIN = deriveRootDomain();

/**
 * Tailwind grid-cols class map untuk public store product grid.
 * Dipakai oleh src/components/store/product/product-grid.tsx.
 *
 * @example
 *   <div className={`grid ${GRID_COLS[columns]} gap-4`}>
 */
export const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
};

/**
 * Total image slots di product form Step Media.
 * Dipakai oleh src/components/dashboard/product/form/step-media.tsx.
 *
 * Nilai 5 = max slot tier BUSINESS (FREE=2, STARTER=3, BUSINESS=5).
 * Array.from({ length: TOTAL_SLOTS }) render semua slot (filled/empty/locked).
 */
export const TOTAL_SLOTS = 5;