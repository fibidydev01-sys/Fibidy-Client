// src/components/discover/buy-button.tsx
'use client';

// ==========================================
// BUY BUTTON + POLICY CHECKBOX
// ==========================================

import { useState } from 'react';
import { ShoppingCart, LogIn } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useAuthDialogStore } from '@/stores/auth-dialog-store';
import type { PublicProduct } from '@/types/product';

interface BuyButtonProps {
  product: PublicProduct;
  isAuthenticated: boolean;
  isLoading: boolean;
  onBuy: () => void;
}

export function BuyButton({
  product,
  isAuthenticated,
  isLoading,
  onBuy,
}: BuyButtonProps) {
  const t = useTranslations('discover.buyButton');
  const { open } = useAuthDialogStore();
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="mt-8 space-y-2">
        <Button className="w-full" size="lg" onClick={open}>
          <LogIn className="mr-2 h-4 w-4" />
          {t('signInToBuy')}
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          {t('signInHint')}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acceptedPolicy}
          onChange={(e) => setAcceptedPolicy(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border"
        />
        <span className="text-sm text-muted-foreground leading-relaxed">
          {t('policyAgreement')}
        </span>
      </label>

      <Button
        className="w-full"
        size="lg"
        onClick={onBuy}
        disabled={!acceptedPolicy || isLoading}
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {isLoading
          ? t('redirecting')
          : t('buyNow', { price: product.price.toFixed(2) })}
      </Button>
    </div>
  );
}