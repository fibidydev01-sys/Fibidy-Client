'use client';

// ==========================================
// BUY BUTTON — Discover marketplace CTA
// File: src/components/discover/buy-button.tsx
//
// [IDR MIGRATION — May 2026]
// Replaced hardcoded `${product.price.toFixed(2)} ${product.currency}`
// with `formatPrice(price, currency ?? 'IDR')`. Pre-migration this
// rendered "50000.00 IDR" — wrong format. formatPrice handles
// locale-correct symbol placement and decimal rules.
//
// [AUTH GATE FIX — May 2026]
// Added `isAuthenticated` prop. Pre-fix: button always rendered the
// "Buy Now" CTA and called `onBuy()` regardless of auth state →
// non-authenticated users hit /checkout/session API → 401 → confusing
// error toast. Post-fix: when not authenticated, button shows
// "Sign in to buy" with a LogIn icon, and parent's onBuy handler can
// route to /login instead of attempting the API call.
//
// Parent (discover/[id]/client.tsx) is expected to handle the routing
// branch in its `onBuy` callback:
//   onBuy={() => isAuthenticated
//     ? checkout(product.id, 'DISCOVER')
//     : router.push('/login?from=/discover/' + product.id)}
//
// Or, if you prefer the button to handle routing itself, swap the
// conditional render below to wrap a <Link href="/login">.
// ==========================================

import { Button } from '@/components/ui/button';
import { Loader2, ShoppingCart, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatPrice } from '@/lib/shared/format';
import type { PublicProduct } from '@/types/product';

interface BuyButtonProps {
  product: PublicProduct;
  /**
   * Whether the current user is signed in.
   * When false, the button renders a "Sign in to buy" variant and
   * onBuy should route to /login (parent's responsibility).
   */
  isAuthenticated: boolean;
  isLoading?: boolean;
  onBuy: () => void;
}

export function BuyButton({
  product,
  isAuthenticated,
  isLoading,
  onBuy,
}: BuyButtonProps) {
  const t = useTranslations('discover.buyButton');

  // [IDR MIGRATION] Default to IDR. Was: hardcoded $X.XX.
  const currency = product.currency ?? 'IDR';
  const formattedPrice = formatPrice(product.price, currency);

  // ── Not authenticated: prompt sign-in ──────────────────────────
  if (!isAuthenticated) {
    return (
      <Button onClick={onBuy} className="w-full" size="lg">
        <LogIn className="mr-2 h-4 w-4" />
        {t('signInToBuy')}
      </Button>
    );
  }

  // ── Authenticated: buy CTA ─────────────────────────────────────
  return (
    <Button
      onClick={onBuy}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('processing')}
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('buyNow', { price: formattedPrice })}
        </>
      )}
    </Button>
  );
}