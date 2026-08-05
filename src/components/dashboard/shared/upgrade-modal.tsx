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
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            {upgradeTier && upgradeLabel && (
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
              variant={upgradeTier ? 'outline' : 'default'}
              className="w-full"
              onClick={handleViewPlans}
            >
              {upgradeTier ? t('viewAllPlans') : t('viewUpgradePlans')}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              {t('maybeLater')}
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
