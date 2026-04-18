// src/app/checkout/cancel/client.tsx
'use client';

// ==========================================
// CHECKOUT CANCEL
//
// Stripe redirects here when buyer cancels checkout.
// URL: /checkout/cancel?productId=clx...
//
// UX: show message + link back to product page.
// productId is appended by BE (checkout.service.ts) to cancel URL.
// ==========================================

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';

export function CheckoutCancelClient() {
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
          <h1 className="text-2xl font-bold">Purchase Canceled</h1>
          <p className="text-muted-foreground">
            No payment was processed. You can come back anytime.
          </p>
        </div>

        {/* CTA — back to product */}
        {productId ? (
          <Button asChild size="lg" className="w-full">
            <Link href={`/discover/${productId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Product
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href="/discover">
              <Search className="mr-2 h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        )}

        {/* Secondary */}
        {productId && (
          <Button variant="ghost" asChild className="w-full">
            <Link href="/discover">Browse Other Products</Link>
          </Button>
        )}
      </div>
    </div>
  );
}