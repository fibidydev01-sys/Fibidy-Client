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
//      committing to anything) is now the corner X, matching the
//      standard close-affordance every other Dialog in this app already
//      exposes. "Maybe later" as a full labeled row implied it was a
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
//
// [DOUBLE-X FIX — Aug 2026]
// This component used to render its own corner-X `<button>` on top of
// DialogContent, defensively, "in case the base component doesn't
// already supply one" (see prior comment, now removed). It does supply
// one: `components/ui/dialog.tsx`'s `DialogContent` has had
// `showCloseButton = true` by default all along, rendering its own
// `DialogPrimitive.Close` at the exact same `absolute top-4 right-4`
// coordinates. The two X's were stacking, pixel-for-pixel.
//
// Every other Dialog in this app (StudioOnboardingDialog,
// FirstPublishDialog, etc.) either relies on that default silently, or
// explicitly hides it via `[&>button:last-child]:hidden` when the dialog
// is meant to be non-dismissible. This one did neither — it left the
// default on AND added a second X on top of it. Fix: rely on the
// default like every sibling Dialog does. No custom button, no
// className override needed.
// ==========================================

import { useState } from 'react';
import { Crown, AlertTriangle, Zap } from 'lucide-react';
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
import { useRouter } from '@/i18n/navigation';

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
        {/*
          [DOUBLE-X FIX] No custom close button here anymore, and no
          className override to suppress the default. DialogContent's
          own `showCloseButton` (default true) renders the single X in
          the corner, same as every other dismissible Dialog in the app.
        */}
        <DialogContent className="sm:max-w-md">
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