'use client';

// ==========================================
// STRIPE CHECKOUT BUTTON — Store Product Detail
//
// Used in: /store/[slug]/products/[id]
// Different from BuyButton in /discover:
//   - No policy checkbox needed (that's specific to the discover marketplace)
//   - Redirects directly to Stripe checkout
//   - Buyer must sign in first (redirects to /login if not)
//   - Source: DIRECT (bought directly from the seller's store)
//
// [TIDUR-NYENYAK FIX #4] Explicit 409 Conflict handling:
// - Backend uses Redis setNX lock (TTL 120s) to prevent duplicate
//   checkout sessions when user rapidly clicks Buy.
// - If 409 returned → show friendly message, keep button enabled
//   so user can retry after a few seconds.
//
// [IDR MIGRATION — May 2026]
// Default `currency` prop changed: 'USD' → 'IDR'.
// Caller from product-actions.tsx passes currency explicitly, but
// the default fires if a future caller forgets — must match the
// platform default to avoid showing "$50,000.00" for Rp 50.000 products.
// ==========================================

import { useState } from 'react';
import { ShoppingCart, Loader2, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { checkoutApi } from '@/lib/api/checkout';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import { useIsAuthenticated, useAuthChecked } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/shared/format';

interface StripeCheckoutButtonProps {
  productId: string;
  price: number;
  currency?: string;
  className?: string;
}

export function StripeCheckoutButton({
  productId,
  price,
  currency = 'IDR',
  className,
}: StripeCheckoutButtonProps) {
  const t = useTranslations('store.checkout.stripe');
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const isChecked = useAuthChecked();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?from=${returnUrl}`);
      return;
    }

    setIsLoading(true);
    try {
      const { checkoutUrl } = await checkoutApi.createSession(
        productId,
        'DIRECT',
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      // [FIX #4] Explicit 409 handling — user clicked too fast,
      // Redis lock is still held. Tell them to wait, don't panic.
      if (err instanceof ApiRequestError && err.isConflict()) {
        toast.warning(
          t('stillProcessingTitle'),
          {
            description: t('stillProcessingBody'),
          },
        );
      } else {
        toast.error(getErrorMessage(err));
      }
      setIsLoading(false);
    }
  };

  // Skeleton while auth is still being checked
  if (!isChecked) {
    return (
      <Button className={className} disabled size="lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('loading')}
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button className={className} size="lg" onClick={handleCheckout}>
        <LogIn className="mr-2 h-4 w-4" />
        {t('signInToBuy')}
      </Button>
    );
  }

  return (
    <Button
      className={className}
      size="lg"
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('redirecting')}
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {t('buyNow', { price: formatPrice(price, currency) })}
        </>
      )}
    </Button>
  );
}
