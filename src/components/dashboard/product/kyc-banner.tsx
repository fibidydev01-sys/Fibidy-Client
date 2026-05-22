'use client';

// ============================================================================
// KYC BANNER
// File: src/components/dashboard/product/kyc-banner.tsx
//
// [PHASE D — May 2026]
// Early return null jika tenant.isEduMode === true.
// EDU seller tidak perlu KYC — fitur subscription + pembayaran disembunyikan.
//
// [PHASE 3] Coming Soon state when FEATURES.digitalProducts === false
// ============================================================================

import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/stores/auth-store';
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

  // [PHASE D] EDU seller: hide KYC banner entirely
  const tenant = useAuthStore((s) => s.tenant);
  if (tenant?.isEduMode === true) return null;

  // ── Coming Soon — feature flag gated ─────────────────────────
  if (!FEATURES.digitalProducts) {
    return (
      <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
        <Rocket className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="space-y-2">
          <Label text={t('label')} className="text-amber-700 dark:text-amber-400" />
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

  if (!kycStatus) {
    return (
      <Alert>
        <AlertDescription>
          <Label text={t('label')} />
          <p className="text-sm mt-1 text-muted-foreground">{t('loading')}</p>
        </AlertDescription>
      </Alert>
    );
  }

  if (kycStatus === 'NOT_STARTED') {
    const isReturning = hasStripeAccount;
    return (
      <Alert>
        <AlertDescription className="space-y-2">
          <Label text={t('label')} />
          <p className="text-sm">
            {isReturning ? tStates('notStartedReturning') : tStates('notStartedFresh')}
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

  if (kycStatus === 'NEEDS_MORE_INFO') {
    return (
      <Alert variant="destructive">
        <AlertDescription className="space-y-2">
          <Label text={t('label')} />
          {errors.length > 0 ? (
            <>
              <p className="text-sm font-medium">{tStates('needsMoreInfoTitle')}</p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm">{err.message}</li>
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

  if (kycStatus === 'ACTIVE') {
    if (hasFutureRequirements) {
      return (
        <Alert>
          <AlertDescription className="space-y-2">
            <Label text={t('label')} />
            <p className="text-sm">
              {tStates('activeWithFutureReq')}
              {futureRequirementsDeadline
                ? tStates('activeWithFutureReqDeadline', { date: formatDate(futureRequirementsDeadline) })
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

function Label({ text, className }: { text: string; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-wide opacity-60 ${className ?? ''}`}>
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
    <Button size="sm" variant={variant} onClick={onClick} disabled={disabled} className="mt-1">
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
