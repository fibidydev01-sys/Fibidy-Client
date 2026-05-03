'use client';

// KYC Banner — always visible, text changes per state.
//
// State coverage:
//   COMING_SOON (FEATURES.digitalProducts === false) → disabled "Coming Soon"
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
//
// [PHASE 3 — DIGITAL PRODUCTS FLAG]
// Previously this component returned `null` when
// `FEATURES.digitalProducts === false`, which hid it entirely.
// Per the May 2026 design feedback, the banner should still appear
// when the feature is gated — but as a friendly, disabled
// "Coming Soon" tile so sellers can SEE that payment verification
// is on the roadmap without being able to act on it yet.
//
// useKycStatus() is also gated via React Query's `enabled` so this
// component receives `kycStatus = undefined` when the flag is off —
// the early-return below short-circuits BEFORE any of that matters,
// so no spinner flash, no 503 noise.

import { useTranslations } from 'next-intl';
import { useInitiateKyc } from '@/hooks/dashboard/use-products';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, Rocket } from 'lucide-react';
import { FEATURES } from '@/lib/config/features';
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
  const t = useTranslations('dashboard.kycBanner');
  const tStates = useTranslations('dashboard.kycBanner.states');
  const tActions = useTranslations('dashboard.kycBanner.actions');
  const { initiateKyc, isLoading } = useInitiateKyc();

  // ── Coming Soon — feature flag gated ─────────────────────────
  // Replaces the old `if (!FEATURES.digitalProducts) return null`.
  // We render a friendly amber tile + disabled "Coming Soon" button
  // so the verification flow's existence is still visible.
  if (!FEATURES.digitalProducts) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <Rocket className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="space-y-2">
          <Label
            text={t('label')}
            className="text-amber-700 dark:text-amber-400"
          />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            {tStates('comingSoon')}
          </p>
          <Button size="sm" variant="outline" disabled className="mt-1">
            <Rocket className="h-3.5 w-3.5 mr-1.5" />
            {tActions('comingSoonButton')}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // ── isPolling — merchant just returned from Stripe ───────────
  if (isPolling) {
    return (
      <Alert>
        <AlertDescription>
          <Label text={t('label')} />
          <div className="flex items-center gap-2 mt-1">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <span className="text-sm">{t('polling')}</span>
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
          <Label text={t('label')} />
          <p className="text-sm mt-1 text-muted-foreground">
            {t('loading')}
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
          <Label text={t('label')} />
          <p className="text-sm">
            {isReturning
              ? tStates('notStartedReturning')
              : tStates('notStartedFresh')}
          </p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            loadingLabel={tActions('loading')}
          >
            {isReturning ? tActions('continueSetup') : tActions('setupPayments')}
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
          <Label text={t('label')} />
          <p className="text-sm">{tStates('pending')}</p>
        </AlertDescription>
      </Alert>
    );
  }

  // ── NEEDS_MORE_INFO ───────────────────────────────────────────
  if (kycStatus === 'NEEDS_MORE_INFO') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label text={t('label')} />
          {errors.length > 0 ? (
            <>
              <p className="text-sm font-medium">
                {tStates('needsMoreInfoTitle')}
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
            <p className="text-sm">{tStates('needsMoreInfoGeneric')}</p>
          )}
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            loadingLabel={tActions('loading')}
            variant="outline"
          >
            {tActions('completeDocuments')}
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
          <Label text={t('label')} />
          <p className="text-sm font-semibold">{tStates('pastDueHeadline')}</p>
          <p className="text-sm">{tStates('pastDueBody')}</p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            loadingLabel={tActions('loading')}
            variant="outline"
          >
            {tActions('completeNow')}
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
          <Label text={t('label')} />
          <p className="text-sm">{tStates('chargesOnly')}</p>
          <ActionButton
            onClick={() => initiateKyc()}
            disabled={isLoading}
            isLoading={isLoading}
            loadingLabel={tActions('loading')}
          >
            {tActions('activatePayouts')}
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
            <Label text={t('label')} />
            <p className="text-sm">
              {tStates('activeWithFutureReq')}
              {futureRequirementsDeadline
                ? tStates('activeWithFutureReqDeadline', {
                    date: formatDate(futureRequirementsDeadline),
                  })
                : ''}
              .
            </p>
            <ActionButton
              onClick={() => initiateKyc()}
              disabled={isLoading}
              isLoading={isLoading}
              loadingLabel={tActions('loading')}
              variant="outline"
            >
              {tActions('viewUpdates')}
            </ActionButton>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <AlertDescription>
          <Label text={t('label')} className="text-green-700 dark:text-green-400" />
          <p className="text-sm text-green-800 dark:text-green-300 mt-1">
            {tStates('activeClean')}
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
          <Label text={t('label')} />
          <p className="text-sm">{tStates('rejected')}</p>
          <Button size="sm" variant="outline" asChild>
            <a href="mailto:support@fibidy.com">{tActions('contactSupport')}</a>
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────

function Label({ text, className }: { text: string; className?: string }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-wide opacity-60 ${className ?? ''}`}
    >
      {text}
    </p>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  isLoading,
  loadingLabel,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  loadingLabel: string;
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
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
