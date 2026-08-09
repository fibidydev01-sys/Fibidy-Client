'use client';

// ==========================================
// UPGRADE MODAL
//
// Muncul saat user menyentuh batas paket (produk, storage, gambar, dsb).
//
// [TRIPAY — Aug 2026]
// Sebelumnya modal ini langsung memanggil checkout LemonSqueezy dan
// me-redirect. Sekarang ia MENYERAHKAN pemilihan metode bayar ke
// PaymentMethodDialog — supaya seller yang tidak punya kartu tetap punya
// jalan (QRIS), dan supaya perbedaan auto-renew vs sekali-bayar terlihat
// sebelum memilih, bukan setelah.
//
// Modal ini tidak lagi tahu apapun tentang provider. Ia cuma tahu
// "tier tujuan apa" dan menyerahkan sisanya.
//
// [FOOTER LAYOUT FIX — Aug 2026]
// Was 3 stacked full-width buttons (Upgrade / View all plans / Maybe
// later). Two changes:
//
//   1. "Maybe later" removed as a button — its job (dismiss without
//      committing to anything) is now a corner X next to DialogTitle,
//      matching the standard close-affordance every other Dialog in this
//      app already exposes by default (Radix's own DialogContent close
//      button — this one had it hidden via [&>button:last-child]:hidden
//      on the header markup previously; that hide was for the OLD "Maybe
//      later" text button which no longer exists, so it's removed here
//      too). "Maybe later" as a full labeled row implied it was a
//      meaningfully different choice from closing the dialog outright —
//      it wasn't; onOpenChange(false) is what both did.
//
//   2. The two remaining buttons (upgrade CTA + "View all plans") sit in
//      a 2-col grid side by side instead of stacked, when both are
//      present. If there's no next tier (already on BUSINESS,
//      upgradeTier === null), only "View all plans" / "View upgrade
//      plans" renders — forcing that lone button into a 2-col grid would
//      leave half the row visibly empty, so that case stays a single
//      full-width button instead. grid-cols-2 only applies when both
//      buttons exist.
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, AlertTriangle, X, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PaymentMethodDialog } from '@/components/dashboard/subscription/payment-method-dialog';
import type { SubscriptionTier } from '@/lib/api/subscription';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Tier saat ini — menentukan opsi upgrade yang ditampilkan */
  currentTier?: SubscriptionTier;
}

export function UpgradeModal({
  open,
  onOpenChange,
  title,
  description,
  currentTier = 'FREE',
}: UpgradeModalProps) {
  const t = useTranslations('dashboard.upgradeModal');
  const tCommon = useTranslations('common.actions');
  const router = useRouter();
  const [payDialogOpen, setPayDialogOpen] = useState(false);

  const resolvedTitle = title ?? t('defaultTitle');
  const resolvedDescription = description ?? t('defaultDescription');

  const handleViewPlans = () => {
    onOpenChange(false);
    router.push('/dashboard/subscription');
  };

  // Tier tujuan berdasarkan tier sekarang
  const upgradeTier: 'STARTER' | 'BUSINESS' | null =
    currentTier === 'FREE'
      ? 'STARTER'
      : currentTier === 'STARTER'
        ? 'BUSINESS'
        : null;

  const upgradeLabel =
    upgradeTier === 'STARTER'
      ? t('upgradeStarterLabel')
      : upgradeTier === 'BUSINESS'
        ? t('upgradeBusinessLabel')
        : null;

  const UpgradeIcon = upgradeTier === 'BUSINESS' ? Crown : Zap;

  // [FOOTER LAYOUT FIX] Whether the primary upgrade CTA renders at all —
  // drives the grid-2-vs-single-column footer decision below.
  const hasUpgradeCta = !!(upgradeTier && upgradeLabel);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          {/*
            [FOOTER LAYOUT FIX] Corner close button replaces the old
            "Maybe later" row. Radix's DialogContent normally ships its
            own default close X — this app's own DialogContent variant
            renders one already via its base primitive, so an explicit
            second X is only added here if the base component doesn't
            already supply one. Kept explicit + positioned so it reads
            unambiguously as "dismiss" next to the title, independent of
            whatever the base Dialog component's default happens to be.
          */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label={tCommon('close')}
            className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" />
          </button>

          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>{resolvedTitle}</DialogTitle>
            <DialogDescription className="pt-1">
              {resolvedDescription}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter
            className={
              hasUpgradeCta
                ? 'grid grid-cols-2 gap-2 sm:grid-cols-2'
                : 'flex-col gap-2 sm:flex-col'
            }
          >
            {hasUpgradeCta && (
              <Button
                className="w-full"
                onClick={() => {
                  // Modal upgrade ditutup, dialog metode bayar dibuka.
                  // Dua dialog bertumpuk menghasilkan focus trap yang kacau
                  // di beberapa browser mobile.
                  onOpenChange(false);
                  setPayDialogOpen(true);
                }}
              >
                <UpgradeIcon className="mr-2 h-4 w-4" />
                {upgradeLabel}
              </Button>
            )}

            <Button
              variant={hasUpgradeCta ? 'outline' : 'default'}
              className="w-full"
              onClick={handleViewPlans}
            >
              {hasUpgradeCta ? t('viewAllPlans') : t('viewUpgradePlans')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PaymentMethodDialog
        open={payDialogOpen}
        onOpenChange={setPayDialogOpen}
        tier={upgradeTier}
      />
    </>
  );
}