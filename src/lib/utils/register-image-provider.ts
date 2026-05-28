// ============================================================================
// REGISTER IMAGE PROVIDER
// File: client/src/lib/utils/register-image-provider.ts
//
// Pure function: derive the right-side image URL from wizard state.
// No React, no side effects — safe to call in render.
//
// MAPPING:
//   Step 1 (Intent)
//     BUYER  → Unsplash: shopping / buyer lifestyle
//     SELLER → Unsplash: entrepreneur / storefront
//     EDU    → Unsplash: campus / graduation
//     null   → '' (blank — CSS bg will show)
//
//   Step 2 (Category) → CATEGORY_AUTOFILL[key].heroBackgroundImage
//     Falls back to __default__ image if key not found.
//
//   Step 3 (Store Details) → Globe / earth
//   Step 4 (Account)       → Security / shield / lock
//   Step 5 (Review)        → Map / location / pins
//
//   BUYER flow only has 3 steps:
//     Step 1 → Intent image (same as SELLER/EDU)
//     Step 2 → Account image (security)
//     Step 3 → Review image (map)
// ============================================================================

import type { RegisterIntent } from '@/types/auth';
import { CATEGORY_AUTOFILL } from '@/lib/constants/shared/category-autofill';

// ── Intent images ────────────────────────────────────────────────────────────

const INTENT_IMAGES: Record<RegisterIntent, string> = {
  BUYER: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80&auto=format&fit=crop',
  // Shopping bags, fashion district — buyer energy
  SELLER: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&auto=format&fit=crop',
  // Entrepreneur at counter — seller/storefront energy
  EDU: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80&auto=format&fit=crop',
  // Graduation caps in the air — student/edu energy
};

// ── Fixed step images ─────────────────────────────────────────────────────────

/** Step 3 SELLER/EDU — Store Details */
const STORE_DETAILS_IMAGE =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80&auto=format&fit=crop';
// Earth from space — globe representing "your store, the world"

/** Step 4 SELLER/EDU — Account (email + password + WhatsApp) */
const ACCOUNT_IMAGE =
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80&auto=format&fit=crop';
// Lock / digital security visual — account & security

/** Step 5 SELLER/EDU — Review */
const REVIEW_IMAGE =
  'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80&auto=format&fit=crop';
// City map from above — launch, location, "your store on the map"

/** Step 2 BUYER — Account */
const BUYER_ACCOUNT_IMAGE = ACCOUNT_IMAGE;

/** Step 3 BUYER — Review */
const BUYER_REVIEW_IMAGE = REVIEW_IMAGE;

// ── Default (no selection yet) ────────────────────────────────────────────────
// Empty string → auth-layout renders a solid dark CSS background.
// No external image load on first paint.
export const REGISTER_DEFAULT_IMAGE = '';

// ── Main derive function ──────────────────────────────────────────────────────

export interface WizardImageState {
  currentStep: number;
  intent: RegisterIntent | null;
  category?: string;
}

/**
 * Derive the right-column image URL for the register wizard.
 * Returns '' when no image should show (CSS background takes over).
 */
export function deriveRegisterImage(state: WizardImageState): string {
  const { currentStep, intent, category } = state;

  // ── Step 1: Intent selection ─────────────────────────────────────────────
  if (currentStep === 1) {
    if (!intent) return REGISTER_DEFAULT_IMAGE;
    return INTENT_IMAGES[intent];
  }

  // ── BUYER flow (3 steps total) ───────────────────────────────────────────
  if (intent === 'BUYER') {
    if (currentStep === 2) return BUYER_ACCOUNT_IMAGE;
    if (currentStep === 3) return BUYER_REVIEW_IMAGE;
    return REGISTER_DEFAULT_IMAGE;
  }

  // ── SELLER / EDU flow (5 steps total) ───────────────────────────────────
  // Step 2: Category
  if (currentStep === 2) {
    if (!category) {
      // No category selected yet → use intent image as continuity
      return intent ? INTENT_IMAGES[intent] : REGISTER_DEFAULT_IMAGE;
    }
    const autofill = (CATEGORY_AUTOFILL as Record<string, { heroBackgroundImage: string }>)[category];
    return autofill?.heroBackgroundImage ?? CATEGORY_AUTOFILL.__default__.heroBackgroundImage;
  }

  // Step 3: Store Details
  if (currentStep === 3) return STORE_DETAILS_IMAGE;

  // Step 4: Account
  if (currentStep === 4) return ACCOUNT_IMAGE;

  // Step 5: Review
  if (currentStep === 5) return REVIEW_IMAGE;

  return REGISTER_DEFAULT_IMAGE;
}
