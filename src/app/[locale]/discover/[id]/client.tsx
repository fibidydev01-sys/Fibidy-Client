// src/app/discover/[id]/client.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useCheckout } from '@/hooks/dashboard/use-checkout';
import { usePreview } from '@/hooks/shared/use-preview';
import {
  useIsAuthenticated,
  useAuthChecked,
  useAuthStore,
} from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';
import { DiscoverDetail } from '@/components/discover/discover-detail';
import { PdfPreview } from '@/components/discover/pdf-preview';
import { BuyButton } from '@/components/discover/buy-button';
import { ContactSellerButton } from '@/components/store/checkout/contact-seller-button';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';
import type { PublicProduct } from '@/types/product';

interface Props {
  product: PublicProduct;
}

export function DiscoverDetailClient({ product }: Props) {
  const isAuthenticated = useIsAuthenticated();
  const isChecked = useAuthChecked();
  const { setTenant, setChecked } = useAuthStore();
  const hasCheckedRef = useRef(false);
  const { checkout, isLoading } = useCheckout();

  // Preview — fetch signed URL + metadata
  const { preview, loading: previewLoading, refreshPreview } = usePreview(product.id);

  // Auth check
  useEffect(() => {
    if (hasCheckedRef.current || isChecked) return;
    hasCheckedRef.current = true;

    const run = async () => {
      try {
        const response = await authApi.status();
        setTenant(
          response.authenticated && response.tenant ? response.tenant : null,
        );
      } catch {
        setTenant(null);
      } finally {
        setChecked(true);
      }
    };

    run();
  }, [isChecked, setTenant, setChecked]);

  const pageCount = preview?.previewData?.pageCount ?? null;

  // Skeleton while auth is being checked
  if (!isChecked) {
    return (
      <div className="container px-4 py-8 max-w-4xl mx-auto space-y-8">
        <Skeleton className="h-64 w-full rounded-lg" />
        <DiscoverDetail product={product} pageCount={pageCount} />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto space-y-8">
      {/* ── Preview Section ─────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        {previewLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : preview ? (
          <PdfPreview
            previewUrl={preview.previewUrl}
            maxPages={preview.maxPreviewPages}
            pageCount={pageCount}
            onRefresh={refreshPreview}
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Preview not available
            </p>
          </div>
        )}
      </section>

      {/* ── Product Info ────────────────────────────────────────── */}
      <DiscoverDetail product={product} pageCount={pageCount} />

      {/* ── Policy Notice ──────────────────────────────────────── */}
      <section className="bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <Info className="inline h-4 w-4 mr-1.5 -mt-0.5" />
          <strong>All sales are final.</strong> Digital products cannot be
          returned once purchased. Please review the preview above before
          buying.
        </p>
      </section>

      {/* ── Action Buttons ─────────────────────────────────────── */}
      <div className="space-y-4">
        <BuyButton
          product={product}
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          onBuy={() => checkout(product.id, 'DISCOVER')}
        />

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <ContactSellerButton
          productName={product.name}
          sellerName={product.sellerName}
          sellerWhatsapp={product.sellerWhatsapp ?? ''}
          price={product.price}
          currency={product.currency}
          className="w-full"
          variant="outline"
          size="lg"
        />

        <p className="text-xs text-center text-muted-foreground">
          Have questions? Contact the seller directly via WhatsApp before purchasing.
        </p>
      </div>
    </div>
  );
}