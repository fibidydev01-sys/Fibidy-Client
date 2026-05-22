// ============================================================================
// USE SELLER SETUP AUTOFILL — Phase B
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/use-seller-setup-autofill.ts
//
// [SETUP-GATE Phase B — May 2026]
// Returns autofill values for the seller setup wizard based on tenant category.
//
// Key behaviours:
//   - Memoized — only recalculates when category or storeName changes
//   - Interpolates {{storeName}} in all string fields
//   - Deep-clones aboutFeatures so seller edits do NOT mutate the template constant
//   - Falls back to __default__ for unknown / custom categories
// ============================================================================

import { useMemo } from 'react';
import {
  getCategoryAutofill,
  interpolate,
} from '@/lib/constants/shared/category-autofill';
import type { FeatureItem } from '@/types/tenant';

// ─── Return shape ─────────────────────────────────────────────────────────────

export interface AutofillResult {
  primaryColor: string;
  heroBackgroundImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  aboutFeatures: FeatureItem[];
  contactTitle: string;
  contactSubtitle: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns smart-default values for the seller setup wizard.
 *
 * @param category  - tenant.category key (e.g. 'CAFE', 'BARBERSHOP')
 * @param storeName - tenant.name used to interpolate {{storeName}} placeholders
 *
 * @example
 *   const autofill = useSellerSetupAutofill('CAFE', 'Kopi Senja');
 *   // autofill.heroTitle === 'Welcome to Kopi Senja'
 *   // autofill.primaryColor === '#8B4513'
 */
export function useSellerSetupAutofill(
  category: string,
  storeName: string,
): AutofillResult {
  return useMemo(() => {
    const template = getCategoryAutofill(category);

    // Interpolation helper — replaces {{storeName}} in every string field
    const i = (s: string) => interpolate(s, storeName, category);

    return {
      primaryColor: template.primaryColor,
      heroBackgroundImage: template.heroBackgroundImage,
      heroTitle: i(template.heroTitle),
      heroSubtitle: i(template.heroSubtitle),
      heroCtaText: i(template.heroCtaText),
      contactTitle: i(template.contactTitle),
      contactSubtitle: i(template.contactSubtitle),
      // Deep clone — seller edits must NOT mutate CATEGORY_AUTOFILL constant
      aboutFeatures: template.aboutFeatures.map((f) => ({ ...f })),
    };
  }, [category, storeName]);
}
