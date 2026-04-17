'use client';

// ==========================================
// STRIPE CHECKOUT BUTTON — Store Product Detail
//
// Dipakai di: /store/[slug]/products/[id]
// Berbeda dari BuyButton di /discover:
//   - Tidak perlu policy checkbox (itu khusus discover marketplace)
//   - Langsung redirect ke Stripe checkout
//   - Buyer harus login dulu (redirect ke /login kalau belum)
//   - Source: DIRECT (beli langsung dari toko seller)
//
// [TIDUR-NYENYAK FIX #4] Explicit 409 Conflict handling:
// - Backend uses Redis setNX lock (TTL 120s) to prevent duplicate
//   checkout sessions when user rapidly clicks Buy.
// - If 409 returned → show friendly message, keep button enabled
//   so user can retry after a few seconds.
// ==========================================

import { useState } from 'react';
import { ShoppingCart, Loader2, LogIn } from 'lucide-react';
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
  currency = 'USD',
  className,
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const isChecked = useAuthChecked();
  const router = useRouter();

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      // Redirect ke login dengan return URL
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
          'Sedang memproses checkout sebelumnya',
          {
            description:
              'Tunggu beberapa detik lalu coba lagi. Jika kamu sudah diarahkan ke Stripe, selesaikan pembayaran di tab tersebut.',
          },
        );
      } else {
        toast.error(getErrorMessage(err));
      }
      setIsLoading(false);
    }
  };

  // Skeleton selama auth belum dicek
  if (!isChecked) {
    return (
      <Button className={className} disabled size="lg">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Memuat...
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button className={className} size="lg" onClick={handleCheckout}>
        <LogIn className="mr-2 h-4 w-4" />
        Login untuk Membeli
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
          Mengarahkan ke Stripe...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Beli Sekarang — {formatPrice(price, currency)}
        </>
      )}
    </Button>
  );
}
