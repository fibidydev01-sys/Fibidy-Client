// src/lib/api/checkout.ts
//
// P0 FIX: source parameter added to createSession.
// Without source, all Discover purchases default to DIRECT fee tier,
// causing platform revenue loss on every Discover sale.
//
// [TYPE FIX — May 2026]
// 1. Added `verify(sessionId)` as an alias for `verifySession(sessionId)`.
//    The success page (checkout/success/client.tsx) was calling
//    `checkoutApi.verify(sessionId)` which didn't exist on the contract,
//    causing a TS error and a runtime crash on the success page.
//
// 2. Extended `VerifySessionResponse.purchase` with `id` and `fileKey`
//    so the success page can render the "Download" CTA branch when the
//    purchase is for a digital product.

import { api } from './client';

// Response from GET /checkout/verify?sessionId=xxx
export interface VerifySessionResponse {
  status: 'pending' | 'completed';
  purchase?: {
    id: string;
    productName: string;
    paidAmount: number;
    currency: string;
    /** R2 storage key — present only when the purchased product is digital. */
    fileKey?: string | null;
  };
}

export const checkoutApi = {
  createSession: (
    productId: string,
    source?: 'DIRECT' | 'DISCOVER',
  ): Promise<{ checkoutUrl: string }> =>
    api.post('/checkout/session', { productId, source }),

  // Poll setelah Stripe redirect — cek apakah webhook sudah create Purchase
  verifySession: (sessionId: string): Promise<VerifySessionResponse> =>
    api.get('/checkout/verify', { params: { sessionId } }),

  /**
   * Alias for `verifySession()` — kept so callers can use the same name
   * as `subscriptionApi.verify()`. The success page was already coded
   * against this name; this alias closes the contract gap.
   */
  verify: (sessionId: string): Promise<VerifySessionResponse> =>
    api.get('/checkout/verify', { params: { sessionId } }),
};
