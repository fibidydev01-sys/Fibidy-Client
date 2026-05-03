// ==========================================
// PRODUCT TYPES — Unified
//
// Product = single model. Digital fields nullable.
// If fileKey exists → product with file (Stripe checkout)
// If fileKey null → product without file (WA order only)
//
// [TIDUR-NYENYAK FIX #1] Added downloadRevoked field to Purchase
//
// [IDR MIGRATION — May 2026]
// AUDIT-ONLY changes: Product.price stays `number` (NOT branded type).
//   - price: integer Rupiah on the wire from BE (e.g. 50000 = Rp 50.000).
//     DO NOT multiply by 100 anywhere in FE — BE handles Stripe minor unit.
//   - comparePrice: integer Rupiah, optional, 0 means "no compare price".
//   - currency: optional ISO 4217 code. If null/undefined, FE defaults to 'IDR'.
//
// [RESTORE PATCH — May 2026]
// Restored from backup after a partial replace event. Also adds 4 types
// that were missing from the previous file but referenced by other modules:
//   - PublicProduct       (discover/[id]/client.tsx, BuyButton, DiscoverDetail)
//   - DiscoverResponse    (lib/api/discover.ts)
//   - Purchase            (lib/api/library.ts, checkout/success/client.tsx)
//   - DownloadUrlResponse (lib/api/library.ts)
// All other types preserved verbatim from the pre-replace original.
//
// [TYPE PARITY FIX — May 2026]
// The buyer-library API actually returns these field names that diverged
// from this type: `purchaseId`, `fileType`, and a denormalized `seller`
// object. The Purchase type now declares them so the library components
// (library-card, library-grid, refund-button, refund-dialog) compile.
//
// To stay backward compatible with `checkout/success/client.tsx` (which
// reads `purchase.id`), we keep BOTH `id` AND `purchaseId` as required
// strings. BE returns the same value under both names; if BE only returns
// one, the fetch layer or a lightweight adapter should mirror it before
// handing the object to React. (See library.ts api wrapper for where
// such mirroring would go.)
//
// `seller` is optional — older purchases or non-buyer queries may
// not include it. Components null-check before reading.
// ==========================================

import type { SubscriptionTier } from '@/lib/api/subscription';

// ==========================================
// PRODUCT
// ==========================================

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  price: number;
  comparePrice?: number | null;
  images: string[];
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // ── File fields (nullable) ────────────────
  currency?: string;
  fileKey?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSizeMb?: number | null;
  previewData?: { pageCount: number } | null;

  // ── Counts ────────────────────────────────
  _count?: { purchases: number };
}

// Helper — check if product has a file
export function isDigitalProduct(product: Pick<Product, 'fileKey'>): boolean {
  return !!product.fileKey;
}

// ==========================================
// PRODUCT INPUTS
// ==========================================

export interface CreateProductInput {
  name: string;
  description?: string;
  category?: string;
  price: number;
  comparePrice?: number;
  images?: string[];
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQueryParams {
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined;
}

// ==========================================
// UPLOAD FLOW
// ==========================================

export interface CreateProductUploadInput {
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSizeMb: number;
  name: string;
  description?: string;
  price: number;
}

export interface UpdateProductFileInput {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

export interface InitiateUploadResponse {
  uploadUrl: string;
  fileKey: string;
}

// ==========================================
// KYC
// ==========================================

export type KycStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'NEEDS_MORE_INFO'
  | 'PAST_DUE'
  | 'REJECTED'
  | 'CHARGES_ONLY'
  | 'ACTIVE';

export interface KycError {
  code: string;
  requirement: string;
  message: string;
}

export interface KycStatusResponse {
  kycStatus: KycStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  disabledReason?: string | null;
  hasStripeAccount: boolean;
  detailsSubmitted: boolean;
  currentDeadline?: string | null;
  pastDue: string[];
  errors: KycError[];
  hasFutureRequirements: boolean;
  futureRequirementsDeadline?: string | null;
}

export interface InitiateKycResponse {
  onboardingUrl: string;
  hasStripeAccount: boolean;
}

// ==========================================
// STORAGE — matches schema SubscriptionTier
// ==========================================

export interface StorageUsage {
  plan: SubscriptionTier; // 'FREE' | 'STARTER' | 'BUSINESS'
  used: { mb: number; gb: string };
  quota: { mb: number; gb: number };
  percentage: number;
  maxFileSizeMb: number;
  allowedFileTypes: readonly string[];
  maxDigitalProducts: number;
}

// ==========================================
// DOWNLOAD HISTORY — SELLER DASHBOARD
// ==========================================

export interface DownloadLogEntry {
  id: string;
  productId: string;
  productName: string;
  productFileType: string;
  buyerName: string;
  buyerEmail: string;
  downloadedAt: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface DownloadHistoryResponse {
  data: DownloadLogEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==========================================
// REFUND — matches backend enums + response shapes
//
// Backend: src/refund/refund.service.ts
// Schema:  RefundRequest model + 3 enums
// ==========================================

export type RefundStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RefundApproveReason = 'FILE_NOT_DOWNLOADABLE' | 'FILE_CORRUPT';

export type RefundRejectReason =
  | 'FILE_ACCESSIBLE_AND_VALID'
  | 'OUTSIDE_TIME_WINDOW'
  | 'ALREADY_REFUNDED';

/** Matches backend library.service.ts → refundRequest select shape */
export interface RefundRequestInfo {
  id: string;
  status: RefundStatus;
  approveReason?: RefundApproveReason | null;
  rejectReason?: RefundRejectReason | null;
  requestedAt: string;
  processedAt?: string | null;
}

/** Matches backend library.service.ts → computed refundEligibility */
export interface RefundEligibility {
  canRequest: boolean;
  reason: 'OUT_OF_WINDOW' | 'ALREADY_REQUESTED' | null;
  daysRemaining: number;
}

/** Response from POST /refund/:purchaseId — approve case */
export interface RefundApprovedResponse {
  status: 'APPROVED';
  reason: RefundApproveReason;
  stripeRefundExecuted: boolean;
  stripeRefundId?: string;
}

/** Response from POST /refund/:purchaseId — reject case */
export interface RefundRejectedResponse {
  status: 'REJECTED';
  reason: RefundRejectReason;
  refundRequest?: RefundRequestInfo;
}

export type RefundResponse = RefundApprovedResponse | RefundRejectedResponse;

/** Full RefundRequest record from GET /refund/:purchaseId */
export interface RefundRequestFull {
  id: string;
  purchaseId: string;
  buyerTenantId: string;
  status: RefundStatus;
  approveReason?: RefundApproveReason | null;
  rejectReason?: RefundRejectReason | null;
  stripeRefundId?: string | null;
  evaluationNotes?: string | null;
  requestedAt: string;
  processedAt?: string | null;
}

/** Item in GET /refund list — includes purchase relation */
export interface RefundListItem extends RefundRequestFull {
  purchase: {
    paidAmount: number;
    currency: string;
    product: {
      name: string;
    };
  };
}

// ==========================================
// [RESTORE PATCH — May 2026] PUBLIC PRODUCT
//
// Product as exposed via public /discover endpoint. Mirrors Product
// fields but adds denormalized seller info for storefront display
// (avoid round-trips for the discover detail page rendering by-name
// + WhatsApp seller link without a separate tenant fetch).
//
// Currency convention: if `currency` is null/undefined, treat as 'IDR'.
// ==========================================

export interface PublicProduct {
  id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  category?: string | null;
  price: number;
  comparePrice?: number | null;
  currency?: string | null;
  images?: string[];

  // Digital product fields
  fileKey?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSizeMb?: number | null;
  previewData?: { pageCount: number } | null;

  // Denormalized seller info
  sellerName: string;
  sellerSlug: string;
  sellerWhatsapp?: string | null;

  createdAt?: string;
}

// ==========================================
// [RESTORE PATCH — May 2026] DISCOVER RESPONSE
// ==========================================

export interface DiscoverResponse {
  data: PublicProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==========================================
// [RESTORE PATCH — May 2026] PURCHASE (Buyer Library)
//
// Returned by /library and /checkout/verify. Tracks what a buyer
// has purchased — drives the Library page rows + checkout success
// confirmation card.
//
// [TIDUR-NYENYAK FIX #1] downloadRevoked added — set true when the
// seller's KYC fails post-sale, blocking new download URL generation
// while preserving the purchase record for refund handling.
//
// [IDR MIGRATION] paidAmount is integer Rupiah for IDR purchases
// (e.g. 50000 = Rp 50.000). currency reflects what was charged.
// formatPrice(paidAmount, currency) handles display correctly.
//
// [TYPE PARITY FIX — May 2026]
// Three additions for buyer-library API parity:
//   - `purchaseId` — kept alongside `id` because BE returns this name
//     in the buyer library payload. Library components were already
//     coded against `purchaseId`. Both fields carry the same value.
//   - `fileType` — alias for `productFileType` used by buyer library.
//   - `seller` — denormalized seller info. Library card shows seller
//     name underneath product name; refund dialog shows seller
//     alongside paid amount.
// ==========================================

export type PurchaseStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Purchase {
  /**
   * Primary key. The buyer-library API returns the same value under
   * both `id` and `purchaseId` so callers can use either.
   */
  id: string;
  /**
   * Alias for `id`. Buyer library API emits this name; library
   * components reference it directly.
   */
  purchaseId: string;

  productId: string;
  productName: string;
  /** Lowercase file extension (e.g. "pdf", "epub"). Same value under both names. */
  productFileType?: string | null;
  fileType?: string | null;

  /** Stripe Checkout Session ID — used for success page polling */
  stripeSessionId?: string | null;

  status: PurchaseStatus;

  /**
   * Amount paid in integer Rupiah (post-IDR migration).
   * E.g., 50000 = Rp 50.000.
   */
  paidAmount: number;

  /** ISO 4217 currency code. Currently 'IDR' for all new purchases. */
  currency: string;

  /**
   * Storage key for the digital file. null for non-digital purchases.
   * Drives whether the success/library row shows a Download CTA.
   */
  fileKey?: string | null;

  /**
   * [TIDUR-NYENYAK FIX #1] When true, seller's KYC has failed post-sale
   * and download URL generation is blocked. Library row should still
   * render (for refund flow) but Download button must be disabled.
   */
  downloadRevoked?: boolean;

  /**
   * Denormalized seller info. Optional because some legacy purchases
   * may not have it joined; components null-check before reading.
   */
  seller?: {
    name: string;
    slug?: string;
  };

  /** Refund metadata — populated only when refund has been requested */
  refundRequest?: RefundRequestInfo | null;
  refundEligibility?: RefundEligibility | null;

  purchasedAt: string;
  completedAt?: string | null;
}

// ==========================================
// [RESTORE PATCH — May 2026] DOWNLOAD URL RESPONSE
//
// Returned by GET /library/:purchaseId/download. Backend issues a
// short-lived signed URL pointing at R2; FE redirects the browser
// to it (or fetches with download attribute).
// ==========================================

export interface DownloadUrlResponse {
  downloadUrl: string;
  /** Seconds until the signed URL expires. Default ~15 minutes. */
  expiresIn: number;
  fileName: string;
}
