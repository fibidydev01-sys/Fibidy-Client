'use client';

// ==========================================
// DISCOVER DETAIL CLIENT
// File: src/app/[locale]/discover/[id]/client.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded UI copy replaced with `useTranslations()` lookups.
// Keys used:
//   - discover.detail.previewHeading     ("Preview")
//   - discover.detail.previewNotAvailable
//   - discover.detail.policyNotice.boldPrefix
//   - discover.detail.policyNotice.body
//   - discover.detail.contactHint
//   - common.actions.or                  (divider between Buy/Contact)
//
// The policy notice bold+body split mirrors the pattern used across the
// codebase for alert-style callouts (e.g. dashboard subscription verify
// banners): JSON provides `boldPrefix` for the `<strong>` span and
// `body` for the rest of the sentence, so translators can reshape the
// relative clause without code changes.
//
// `product.name`, `product.description`, `sellerName`, `sellerWhatsapp`,
// and `product.currency` stay passthrough — those are user-authored or
// data-driven values, not UI copy.
// ==========================================

import { useEffect, useRef } from 'react';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import type { PublicProduct } from '@/types/product';

interface Props {
  product: PublicProduct;
}

export function DiscoverDetailClient({ product }: Props) {
  const t = useTranslations('discover.detail');
  const tActions = useTranslations('common.actions');

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
        <h2 className="text-lg font-semibold mb-4">{t('previewHeading')}</h2>
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
              {t('previewNotAvailable')}
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
          <strong>{t('policyNotice.boldPrefix')}</strong>{' '}
          {t('policyNotice.body')}
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
          <span className="text-xs text-muted-foreground">{tActions('or')}</span>
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
          {t('contactHint')}
        </p>
      </div>
    </div>
  );
}