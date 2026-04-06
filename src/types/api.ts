// ==========================================
// API RESPONSE TYPES
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
}