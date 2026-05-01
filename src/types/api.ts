// ==========================================
// API RESPONSE TYPES
// File: src/types/api.ts
//
// [PHASE 3 CHANGE] Added optional `code` and `feature` to ApiError.
// These are emitted by NestJS DigitalProductsGuard for 503 responses:
//   {
//     "statusCode": 503,
//     "code": "FEATURE_COMING_SOON",
//     "feature": "digital_products",
//     "message": "..."
//   }
// FE detects via `isFeatureDisabled()` helper in lib/api/client.ts.
// ==========================================

/**
 * Pagination metadata
 */
interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * API Error response
 */
export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
  /**
   * Structured error code emitted by certain guards.
   * Currently used by:
   *   - DigitalProductsGuard → "FEATURE_COMING_SOON"
   * Future guards may add more codes — frontend should handle unknown codes
   * gracefully (fall back to generic error display).
   */
  code?: string;
  /**
   * Feature identifier that triggered the error.
   * Currently used by FEATURE_COMING_SOON → "digital_products".
   */
  feature?: string;
}
