// ==========================================
// PRODUCT TYPES — Unified
//
// Product = single model. Digital fields nullable.
// If fileKey exists → product with file (Stripe checkout)
// If fileKey null → product without file (WA order only)
//
// [TIDUR-NYENYAK FIX #1] Added downloadRevoked field to Purchase
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
// LIBRARY — BUYER
//
// Updated: includes refundRequest + refundEligibility
// from backend library.service.ts
//
// [TIDUR-NYENYAK FIX #1] downloadRevoked field
// Set to true when refund is APPROVED → backend blocks download.
// Frontend uses this for definitive UI state (instead of deriving
// from refundRequest.status which can be stale if webhook lags).
// ==========================================

export interface Purchase {
  purchaseId: string;
  productId: string;
  productName: string;
  productDescription?: string | null;
  fileType: string;
  seller: {
    name: string;
    logo?: string | null;
    slug: string;
  };
  purchasedAt: string;
  paidAmount: number;
  currency: string;

  // ── Refund state (from backend library.service.ts) ──
  refundRequest: RefundRequestInfo | null;
  refundEligibility: RefundEligibility;

  // ── [TIDUR-NYENYAK FIX #1] Download access control ──
  // When true → backend will reject download requests with 403.
  // Set by: refund APPROVED via webhook OR manual admin revoke.
  downloadRevoked: boolean;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  fileName: string;
  expiresIn: string;
}

// ==========================================
// DISCOVER — PUBLIC
// ==========================================

export interface PublicProduct {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  fileType: string;
  createdAt?: string;
  sellerName: string;
  sellerSlug: string;
  sellerLogo?: string | null;
  sellerWhatsapp?: string | null;
  totalSales?: number;
}

export interface DiscoverResponse {
  data: PublicProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
