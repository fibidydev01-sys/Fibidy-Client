'use client';

// ==========================================
// PRODUCT ACTIONS — Adaptive
//
// fileKey != null → Digital:
//   - "Tanya Seller" (WA) — pre-sales questions
//   - "Beli Sekarang" (Stripe) — primary action
//
// fileKey == null → Custom/Jasa:
//   - "Pesan via WhatsApp" only
// ==========================================

import { WhatsAppOrderButton } from '../checkout/whatsapp-order-button';
import { StripeCheckoutButton } from '../checkout/stripe-checkout-button';
import type { Product } from '@/types/product';
import type { PublicTenant } from '@/types/tenant';

interface ProductActionsProps {
  product: Product;
  tenant: PublicTenant;
}

export function ProductActions({ product, tenant }: ProductActionsProps) {
  const isDigital = !!product.fileKey;
  const currency = product.currency ?? (isDigital ? 'USD' : 'IDR');

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
            <span className="text-xs text-muted-foreground">atau</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Secondary: WA untuk tanya sebelum beli */}
          <WhatsAppOrderButton
            product={product}
            tenant={tenant}
            className="w-full"
            variant="outline"
            customLabel="Tanya Seller via WhatsApp"
          />
        </div>
      ) : (
        // ── Custom/Jasa: WA only ─────────────────────────────────
        <WhatsAppOrderButton
          product={product}
          tenant={tenant}
          className="w-full"
        />
      )}

      {/* Description */}
      {product.description && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">Deskripsi produk</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      )}
    </div>
  );
}