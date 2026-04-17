// src/lib/api/refund.ts
//
// Matches backend endpoints:
//   POST /refund/:purchaseId  → requestRefund (empty body, throttled 3/min)
//   GET  /refund/:purchaseId  → getRefundStatus
//   GET  /refund              → getMyRefunds

import { api } from './client';
import type {
  RefundResponse,
  RefundRequestFull,
  RefundListItem,
} from '@/types/product';

export const refundApi = {
  /**
   * POST /api/refund/:purchaseId
   *
   * Request a refund. Empty body — system auto-evaluates.
   * Returns APPROVED or REJECTED synchronously.
   * Throttled: 3 per minute (integrity check downloads full file).
   */
  request: (purchaseId: string): Promise<RefundResponse> =>
    api.post(`/refund/${purchaseId}`),

  /**
   * GET /api/refund/:purchaseId
   *
   * Check refund status for a specific purchase.
   */
  getStatus: (purchaseId: string): Promise<RefundRequestFull> =>
    api.get(`/refund/${purchaseId}`),

  /**
   * GET /api/refund
   *
   * List all refund requests for current buyer.
   */
  getMyRefunds: (): Promise<RefundListItem[]> =>
    api.get('/refund'),
};