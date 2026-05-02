'use client';

// ==========================================
// BUY BUTTON — Discover marketplace
//
// Used in: /discover/[id]
// Different from StripeCheckoutButton in /store:
//   - Includes policy checkbox (marketplace requires explicit consent)
//   - Source: DISCOVER (bought from the cross-tenant marketplace)
//
// [IDR MIGRATION — May 2026]
// `t('buyNow', { price: ... })` now receives a formatted IDR string
// instead of `product.price.toFixed(2)` (which produced "50000.00").
// JSON template should be:
//   "buyNow": "Buy Now — {price}"
// (no $ prefix in the JSON — formatPrice already includes the symbol)
// ==========================================

import { useState } from 'react';
import { ShoppingCart, Loader2, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { checkoutApi } from '@/lib/api/checkout';
import { ApiRequestError, getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import { useIsAuthenticated, useAuthChecked } from '@/stores/auth-store';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/shared/format';
import type { DiscoverProduct } from '@/types/discover';

interface BuyButtonProps {
  product: DiscoverProduct;
  className?: string;
}

export function BuyButton({ product, className }: BuyButtonProps) {
  const t = useTranslations('discover.buy');
  const [isLoading, setIsLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const isChecked = useAuthChecked();
  const router = useRouter();

  // [IDR MIGRATION] Format with currency. Was: product.price.toFixed(2).
  const currency = product.currency ?? 'IDR';
  const formattedPrice = formatPrice(product.price, currency);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      router.push(`/login?from=${returnUrl}`);
      return;
    }

    if (!policyAccepted) {
      toast.error(t('mustAcceptPolicy'));
      return;
    }

    setIsLoading(true);
    try {
      const { checkoutUrl } = await checkoutApi.createSession(
        product.id,
        'DISCOVER',
      );
      window.location.href = checkoutUrl;
    } catch (err) {
      if (err instanceof ApiRequestError && err.isConflict()) {
        toast.warning(t('stillProcessingTitle'), {
          description: t('stillProcessingBody'),
        });
      } else {
        toast.error(getErrorMessage(err));
      }
      setIsLoading(false);
    }
  };

  // Skeleton while auth loading
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
      <Button className={className} size="lg" onClick={handleBuy}>
        <LogIn className="mr-2 h-4 w-4" />
        {t('signInToBuy')}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Policy checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="policy"
          checked={policyAccepted}
          onCheckedChange={(checked) => setPolicyAccepted(checked === true)}
        />
        <Label htmlFor="policy" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
          {t('policyLabel')}
        </Label>
      </div>

      <Button
        className={className}
        size="lg"
        onClick={handleBuy}
        disabled={isLoading || !policyAccepted}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('redirecting')}
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {t('buyNow', { price: formattedPrice })}
          </>
        )}
      </Button>
    </div>
  );
}
