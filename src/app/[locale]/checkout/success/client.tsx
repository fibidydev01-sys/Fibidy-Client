'use client';

// ==========================================
// CHECKOUT SUCCESS PAGE — Client component
// File: src/app/[locale]/checkout/success/client.tsx
//
// Polling pattern (mirrors subscription/page.tsx):
//   1. Page loads with ?session_id=... from Stripe redirect
//   2. Poll GET /checkout/verify?session_id=... every 2s
//   3. Backend returns { status: 'pending' | 'completed', purchase? }
//   4. On 'completed' → show success card with price + download link
//   5. On 60s timeout → show retry / contact support
//
// [IDR MIGRATION — May 2026]
// Replaces previous `${purchase.paidAmount.toFixed(2)} {purchase.currency}`
// (rendered "50000.00 IDR") with `formatPrice(paidAmount, currency)`
// (renders "Rp 50.000"). formatPrice handles locale-correct symbol +
// thousand separator + decimal rules.
//
// [TYPE PARITY FIX — May 2026]
// `checkoutApi.verify(sessionId)` is now exposed as an alias of
// `verifySession()` — see lib/api/checkout.ts. The response shape
// also gained a `fileKey?` field so the Download CTA branch below
// resolves cleanly.
// ==========================================

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Download, Loader2, AlertCircle } from 'lucide-react';
import { checkoutApi } from '@/lib/api/checkout';
import { getErrorMessage } from '@/lib/api/client';
import { formatPrice } from '@/lib/shared/format';

// Local type — mirrors expected shape from checkoutApi.verify().
interface PurchaseInfo {
  id: string;
  productName: string;
  paidAmount: number;
  currency: string;
  fileKey?: string | null;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 30; // 60s total

export function CheckoutSuccessClient() {
  const t = useTranslations('checkout.success');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [purchase, setPurchase] = useState<PurchaseInfo | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError(t('missingSessionId'));
      setIsPolling(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const result = await checkoutApi.verify(sessionId);
        if (cancelled) return;

        if (result.status === 'completed' && result.purchase) {
          setPurchase(result.purchase);
          setIsPolling(false);
          return;
        }

        if (attempts >= POLL_MAX_ATTEMPTS) {
          setError(t('timeout'));
          setIsPolling(false);
          return;
        }

        attempts++;
        setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        if (cancelled) return;
        if (attempts >= POLL_MAX_ATTEMPTS) {
          setError(getErrorMessage(err));
          setIsPolling(false);
        } else {
          attempts++;
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [sessionId, t]);

  if (isPolling) {
    return (
      <div className="container max-w-md py-16">
        <Card className="p-8 text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
          <h1 className="text-xl font-semibold">{t('processingTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('processingBody')}</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-md py-16">
        <Card className="p-8 text-center space-y-4">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
          <h1 className="text-xl font-semibold">{t('errorTitle')}</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline">
            <Link href="/dashboard/library">{t('viewLibrary')}</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (!purchase) return null;

  return (
    <div className="container max-w-md py-16">
      <Card className="p-8 text-center space-y-6">
        <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('successTitle')}</h1>
          <p className="text-sm text-muted-foreground">{t('successBody')}</p>
        </div>

        <div className="bg-muted rounded-lg p-4 space-y-1 text-sm">
          <p className="font-medium">{purchase.productName}</p>
          {/* [IDR MIGRATION] formatPrice instead of toFixed(2) + currency. */}
          <p className="text-muted-foreground">
            {formatPrice(purchase.paidAmount, purchase.currency)}
          </p>
        </div>

        {/* Library link — buyer can download from there */}
        <Button asChild className="w-full" size="lg">
          <Link href="/dashboard/library">
            {purchase.fileKey ? (
              <>
                <Download className="mr-2 h-4 w-4" />
                {t('viewInLibrary')}
              </>
            ) : (
              t('viewLibrary')
            )}
          </Link>
        </Button>

        <div className="text-xs text-muted-foreground">{t('alsoEmailed')}</div>
      </Card>
    </div>
  );
}
