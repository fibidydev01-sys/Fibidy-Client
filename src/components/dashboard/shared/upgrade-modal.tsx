'use client';

// ==========================================
// UPGRADE MODAL — Stripe Billing
//
// Shown when user hits plan limit (products, storage, images, etc.)
// Can direct-checkout to Stripe or redirect to subscription page.
// ==========================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, AlertTriangle, Zap, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { subscriptionApi } from '@/lib/api/subscription';
import { getErrorMessage } from '@/lib/api/client';
import { toast } from 'sonner';
import type { SubscriptionTier } from '@/lib/api/subscription';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Current tier — determines which upgrade options are shown */
  currentTier?: SubscriptionTier;
}

export function UpgradeModal({
  open,
  onOpenChange,
  title = 'Plan limit reached',
  description = 'Upgrade your plan to unlock higher limits and premium features.',
  currentTier = 'FREE',
}: UpgradeModalProps) {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleDirectCheckout = async (tier: 'STARTER' | 'BUSINESS') => {
    setCheckoutLoading(true);
    try {
      const { checkoutUrl } = await subscriptionApi.createCheckout(tier);
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setCheckoutLoading(false);
    }
  };

  const handleViewPlans = () => {
    onOpenChange(false);
    router.push('/dashboard/subscription');
  };

  // Determine upgrade target based on current tier
  const upgradeTier: 'STARTER' | 'BUSINESS' | null =
    currentTier === 'FREE' ? 'STARTER' :
      currentTier === 'STARTER' ? 'BUSINESS' :
        null;

  const upgradeLabel =
    upgradeTier === 'STARTER' ? 'Upgrade to Starter — $5/mo' :
      upgradeTier === 'BUSINESS' ? 'Upgrade to Business — $15/mo' :
        null;

  const UpgradeIcon = upgradeTier === 'BUSINESS' ? Crown : Zap;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {/* Direct checkout — only if a target tier exists */}
          {upgradeTier && upgradeLabel && (
            <Button
              className="w-full"
              onClick={() => handleDirectCheckout(upgradeTier)}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UpgradeIcon className="mr-2 h-4 w-4" />
              )}
              {upgradeLabel}
            </Button>
          )}

          {/* View plans — always available */}
          <Button
            variant={upgradeTier ? 'outline' : 'default'}
            className="w-full"
            onClick={handleViewPlans}
          >
            {upgradeTier ? 'View all plans' : 'View upgrade plans'}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
