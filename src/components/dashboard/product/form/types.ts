// ─── Product Form Wizard — v3 Unified (3 Steps) ──────────────────────────
//
// Note: Step titles/descriptions are now resolved via i18n in the caller
// (`product.tsx`) using `dashboard.products.form.steps.*`. This file only
// exports the shape/structure; the labels are injected at render time.

export interface WizardStep {
  id: number;
  /** Translation key suffix under `dashboard.products.form.steps.*` */
  key: 'details' | 'file' | 'cover';
  title: string;
  desc: string;
}

/**
 * Legacy constant — kept for backward compat with any code that
 * imports PRODUCT_STEPS directly. Prefer using `buildProductSteps(t)`
 * from product.tsx to get i18n-aware labels.
 */
export const PRODUCT_STEPS: WizardStep[] = [
  { id: 0, key: 'details', title: 'Details', desc: 'Name, description & pricing' },
  { id: 1, key: 'file', title: 'File', desc: 'Upload digital file' },
  { id: 2, key: 'cover', title: 'Cover', desc: 'Cover images (optional)' },
] as const;