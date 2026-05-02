'use client';

// ==========================================
// PRODUCT ACTIONS — Adaptive
//
// fileKey != null → Digital:
//   - "Ask Seller" (WA) — pre-sales questions
//   - "Buy Now" (Stripe) — primary action
//
// fileKey == null → Custom/Service:
//   - "Order via WhatsApp" only
//
// [IDR MIGRATION — May 2026]
// Removed `(isDigital ? 'USD' : 'IDR')` ternary.
// Default to IDR uniformly — Stripe Connect (digital) settles in IDR
// post-migration, custom/service products always were IDR.
// ==========================================

import { useTranslations } from 'next-intl';
import { WhatsAppOrderButton } from '../checkout/whatsapp-order-button';
import { StripeCheckoutButton } from '../checkout/stripe-checkout-button';
import type { Product } from '@/types/product';
import type { PublicTenant } from '@/types/tenant';

interface ProductActionsProps {
  product: Product;
  tenant: PublicTenant;
}

export function ProductActions({ product, tenant }: ProductActionsProps) {
  const t = useTranslations('store.product.detail');
  const tCheckout = useTranslations('store.checkout');
  const isDigital = !!product.fileKey;

  // [IDR MIGRATION] Default to IDR uniformly. Was: ternary digital→USD.
  const currency = product.currency ?? 'IDR';

  return (
    <div className="space-y-4">

      {isDigital ? (
        // ── Digital: Stripe primary + WA secondary ──────────────
        <div className="space-y-3">
          {/* Primary: Stripe checkout */}
          <StripeCheckoutButton
            productId={product.id}
            price={product.price}
            currency={currency}
            className="w-full"
          />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted-foreground">{t('actionsDivider')}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Secondary: WA for pre-sales questions */}
          <WhatsAppOrderButton
            product={product}
            tenant={tenant}
            className="w-full"
            variant="outline"
            customLabel={tCheckout('askSellerWhatsapp')}
          />
        </div>
      ) : (
        // ── Custom/Service: WA only ─────────────────────────────────
        <WhatsAppOrderButton
          product={product}
          tenant={tenant}
          className="w-full"
        />
      )}

      {/* Description */}
      {product.description && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">{t('descriptionHeading')}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}
