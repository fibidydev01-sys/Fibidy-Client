'use client';

// src/hooks/dashboard/use-checkout.ts
//
// P0 FIX: source parameter added.
// Caller must pass 'DISCOVER' when buying from Discover page
// so backend applies correct fee tier (20% vs 2-5%).

import { useState } from 'react';
import { checkoutApi } from '@/lib/api/checkout';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const checkout = async (productId: string, source?: 'DIRECT' | 'DISCOVER') => {
    setIsLoading(true);
    try {
      const { checkoutUrl } = await checkoutApi.createSession(productId, source);
      // Full redirect ke Stripe-hosted checkout page
      // Bukan router.push — bukan SPA navigation
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { checkout, isLoading };
}
