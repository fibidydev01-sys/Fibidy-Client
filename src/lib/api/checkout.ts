// src/lib/api/checkout.ts
//
// P0 FIX: source parameter added to createSession.
// Without source, all Discover purchases default to DIRECT fee tier,
// causing platform revenue loss on every Discover sale.

import { api } from './client';

// Response dari GET /checkout/verify?sessionId=xxx
export interface VerifySessionResponse {
  status: 'pending' | 'completed';
  purchase?: {
    id: string;
    productName: string;
    paidAmount: number;
    currency: string;
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
};
