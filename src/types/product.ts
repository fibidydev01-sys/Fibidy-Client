// ==========================================
// PRODUCT TYPES — Frontend type definitions
//
// [IDR MIGRATION — May 2026]
// AUDIT-ONLY CHANGES — no functional/structural changes to this file.
// The Product.price field stays `number` (NOT a custom IDR branded type).
//
// Conventions documented here for future maintainers:
//   - price: integer Rupiah on the wire from BE (e.g. 50000 = Rp 50.000)
//     Do NOT multiply by 100 anywhere in FE — BE handles conversion to
//     Stripe's minor unit on the checkout path. (IDR is two-decimal in
//     Stripe per their official currency support docs, but that's their
//     internal API contract, not ours.)
//   - comparePrice: integer Rupiah, optional, 0 means "no compare price"
//   - currency: optional ISO 4217 code. If null/undefined, the FE
//     defaults to 'IDR' (see lib/shared/format.ts and all consumers).
//     The field exists to support future multi-currency expansion;
//     currently all paid products on the platform are IDR.
// ==========================================

/**
 * Product as returned by the public store API.
 *
 * Currency convention: if `currency` is null/undefined, treat as 'IDR'.
 * All FE display utilities default to IDR consistent with platform.
 */
export interface Product {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;

  /**
   * Price in integer Rupiah (post-IDR migration).
   * 0 = "contact seller" / custom pricing (custom products only).
   * Minimum paid price: 1000 (enforced BE @Min(1000) and FE Zod).
   */
  price: number;

  /**
   * Original price for "compare at" / strikethrough display.
   * 0 or null = no compare price (not on sale).
   */
  comparePrice?: number | null;

  /**
   * ISO 4217 currency code. Currently always 'IDR' or null.
   * FE defaults to 'IDR' when null/undefined.
   */
  currency?: string | null;

  images?: string[];
  isActive?: boolean;

  /**
   * Storage key for the digital file. Presence of this field is the
   * sole signal that a product is a "digital product" (vs custom/service).
   * - fileKey != null → Digital → Stripe checkout path
   * - fileKey == null → Custom/Service → WhatsApp order path
   */
  fileKey?: string | null;

  fileName?: string | null;
  fileSizeMb?: number | null;

  createdAt?: string;
  updatedAt?: string;
}

export type ProductCreateInput = Pick<
  Product,
  'name' | 'description' | 'category' | 'price' | 'comparePrice' | 'images'
>;

export type ProductUpdateInput = Partial<ProductCreateInput> & {
  isActive?: boolean;
};
