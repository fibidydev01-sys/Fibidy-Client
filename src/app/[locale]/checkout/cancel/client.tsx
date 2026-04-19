// src/app/[locale]/checkout/cancel/client.tsx
'use client';

// ==========================================
// CHECKOUT CANCEL
// File: src/app/[locale]/checkout/cancel/client.tsx
//
// Stripe redirects here when buyer cancels checkout.
// URL: /checkout/cancel?productId=clx...
//
// UX: show message + link back to product page.
// productId is appended by BE (checkout.service.ts) to cancel URL.
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations('checkout.cancel')`.
// JSON keys used:
//   - checkout.cancel.title
//   - checkout.cancel.body
//   - checkout.cancel.backToProduct
//   - checkout.cancel.browseProducts
//   - checkout.cancel.browseOthers
// ==========================================

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function CheckoutCancelClient() {
  const t = useTranslations('checkout.cancel');

  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Cancel icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('body')}</p>
        </div>

        {/* CTA — back to product */}
        {productId ? (
          <Button asChild size="lg" className="w-full">
            <Link href={`/discover/${productId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToProduct')}
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href="/discover">
              <Search className="mr-2 h-4 w-4" />
              {t('browseProducts')}
            </Link>
          </Button>
        )}

        {/* Secondary */}
        {productId && (
          <Button variant="ghost" asChild className="w-full">
            <Link href="/discover">{t('browseOthers')}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}