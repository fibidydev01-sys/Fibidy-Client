'use client';

// KYC Banner — always visible, text changes per state.
//
// State coverage:
//   NOT_STARTED (no account)    → Setup Payment
//   NOT_STARTED (has account)   → Continue Setup
//   PENDING                     → info, no action
//   NEEDS_MORE_INFO (no errors) → warning, Complete Documents
//   NEEDS_MORE_INFO (errors)    → warning, render error list
//   PAST_DUE                    → red error, urgent
//   CHARGES_ONLY                → warning, Activate Payout
//   ACTIVE (no future req)      → green success, no action
//   ACTIVE (has future req)     → info, View Updates
//   REJECTED                    → red error, Contact Support
//   isPolling                   → loading state after returning from Stripe

import { useInitiateKyc } from '@/hooks/dashboard/use-products';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { KycStatus, KycError } from '@/types/product';

interface KycBannerProps {
  kycStatus?: KycStatus;
  hasStripeAccount?: boolean;
  errors?: KycError[];
  hasFutureRequirements?: boolean;
  futureRequirementsDeadline?: string | null;
  isPolling?: boolean;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function KycBanner({
  kycStatus,
  hasStripeAccount,
  errors = [],
  hasFutureRequirements,
  futureRequirementsDeadline,
  isPolling,
}: KycBannerProps) {
  const { initiateKyc, isLoading } = useInitiateKyc();

  // ── isPolling — merchant just returned from Stripe ───────────
  if (isPolling) {
    return (
      <Alert>
        <AlertDescription>
          <Label />
          <div className="flex items-center gap-2 mt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <span className="text-sm">Checking verification status...</span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // ── No data from server yet ───────────────────────────────────
  if (!kycStatus) {
    return (
      <Alert>
        <AlertDescription>
          <Label />
          <p className="text-sm mt-1 text-muted-foreground">
            Loading verification status...
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── NOT_STARTED ───────────────────────────────────────────────
  if (kycStatus === 'NOT_STARTED') {
    const isReturning = hasStripeAccount;
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            {isReturning
              ? "You haven't finished setting up payments. Pick up where you left off."
              : 'Set up payments to start selling digital products.'}
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isReturning ? 'Continue Setup' : 'Set Up Payments'}
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── PENDING ───────────────────────────────────────────────────
  if (kycStatus === 'PENDING') {
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            Verification in progress with Stripe. This usually takes 1–2
            business days.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── NEEDS_MORE_INFO ───────────────────────────────────────────
  if (kycStatus === 'NEEDS_MORE_INFO') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label />
          {errors.length > 0 ? (
            <>
              <p className="text-sm font-medium">
                Verification requires fixes:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm">
                    {err.message}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm">
              Stripe needs additional information to continue account
              verification.
            </p>
          )}
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            variant="outline"
          >
            Complete Documents
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── PAST_DUE ──────────────────────────────────────────────────
  if (kycStatus === 'PAST_DUE') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm font-semibold">
            URGENT: The verification deadline has passed.
          </p>
          <p className="text-sm">
            Your account is at risk of being deactivated soon. Complete
            verification now.
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            variant="outline"
          >
            Complete Now
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── CHARGES_ONLY ──────────────────────────────────────────────
  if (kycStatus === 'CHARGES_ONLY') {
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            Account active for accepting payments. Payouts to your bank are
            not yet active — complete verification to enable payouts.
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
          >
            Activate Payouts
          </ActionButton>
        </AlertDescription>
      </Alert>
    );
  }

  // ── ACTIVE ────────────────────────────────────────────────────
  if (kycStatus === 'ACTIVE') {
    if (hasFutureRequirements) {
      return (
        <Alert>
          <AlertDescription className="space-y-2">
            <Label />
            <p className="text-sm">
              Account active. Stripe has new requirement updates that need
              to be completed
              {futureRequirementsDeadline
                ? ` before ${formatDate(futureRequirementsDeadline)}`
                : ''}
              .
            </p>
            <ActionButton
              onClick={() => initiateKyc()}
              disabled={isLoading}
              isLoading={isLoading}
              variant="outline"
            >
              View Updates
            </ActionButton>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <AlertDescription>
          <Label className="text-green-700 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300 mt-1">
            Account verified. You can accept payments and withdraw funds.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── REJECTED ──────────────────────────────────────────────────
  if (kycStatus === 'REJECTED') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label />
          <p className="text-sm">
            Account verification was rejected by Stripe. Contact our support
            team for help.
          </p>
          <Button size="sm" variant="outline" asChild>
            <a href="mailto:support@fibidy.com">Contact Support</a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────

function Label({ className }: { className?: string }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wide opacity-60 ${className ?? ''}`}
    >
      Stripe Connect Verification
    </p>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  isLoading,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  variant?: 'default' | 'outline';
}) {
  return (
    <Button
      size="sm"
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className="mt-1"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}