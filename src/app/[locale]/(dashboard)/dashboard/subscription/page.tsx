'use client';

// ==========================================
// SUBSCRIPTION PAGE
// File: src/app/[locale]/(dashboard)/dashboard/subscription/page.tsx
//
// Tiers: FREE → STARTER → BUSINESS
//
// Backend is provider-agnostic (Phase 3 — LemonSqueezy migration):
//   - Stripe Checkout (legacy / future)
//   - LemonSqueezy Checkout (active for Indonesia payouts)
//
// Flow:
//   1. Click Subscribe → POST /subscription/checkout?tier=X → checkoutUrl
//   2. window.location.href = checkoutUrl
//   3. After payment, provider redirects back to /dashboard/subscription
//      - Stripe: ?status=success&session_id={CHECKOUT_SESSION_ID}
//      - LS:     ?status=success           (NO sessionId)
//   4. Poll GET /subscription/verify[?sessionId=xxx] every 2s
//   5. On 'completed' → refetch plan, show success
//   6. On 60s timeout:
//      - Stripe path: call POST /subscription/reconcile as fallback
//      - LS path:     show "verification failed" + retry button
//
// Cancel: cancel-at-period-end → user retains access until ends_at
// Business: STARTER + ($200 sales OR 20 transactions)
//
// [PHASE 3 — DIGITAL PRODUCTS FLAG]
//   - Polling no longer requires sessionId (LS-compatible)
//   - Reconcile / retry button visible only for Stripe-provider subs
//   - Digital usage tile + storage tile hidden when FEATURES.digitalProducts off
//   - Tier comparison splits features (physical) + digitalFeatures (with badge)
//   - When digital off, digitalFeatures rendered dimmed with "Coming Soon" badge
//
// [i18n]
// JSON keys used:
//   - `dashboard.subscription.*` for page-level copy
//   - `dashboard.subscription.plans.{FREE,STARTER,BUSINESS}.{name, priceNote, features, digitalFeatures}`
//   - `dashboard.subscription.comingSoonBadge` for the per-feature badge
//   - `dashboard.subscription.verify.*` for the post-checkout banner states
//   - `dashboard.subscription.overLimit.*` for the limit-reached warning card
//   - `dashboard.subscription.badge.*` for the subscription-status badge
//   - `dashboard.subscription.usage.*` for the products/digital/storage usage tiles
//   - `dashboard.subscription.cta.*` for plan-card buttons
//   - `dashboard.subscription.businessUnlock.*` for the qualification progress
//   - `dashboard.subscription.cancelDialog.*` for the cancel confirmation
//   - `dashboard.subscription.platformFee.*` for the fee-per-tier note
//   - `toast.subscription.*` for all toast messages
// ==========================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  Rocket,
  Crown,
  Loader2,
  Calendar,
  AlertTriangle,
  Check,
  X,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  subscriptionApi,
  type SubscriptionInfo,
  type SubscriptionTier,
} from '@/lib/api/subscription';
import { getErrorMessage } from '@/lib/api/client';
import { FEATURES } from '@/lib/config/features';

// ==========================================
// PLAN STATIC CONFIG — icons + prices only (identifier-grade)
// ==========================================

const PLAN_STATIC: Record<
  SubscriptionTier,
  {
    price: string;
    icon: typeof Rocket;
  }
> = {
  FREE: { price: '$0', icon: Rocket },
  STARTER: { price: '$5', icon: Zap },
  BUSINESS: { price: '$15', icon: Crown },
};

// Platform fee per tier — data, not copy
const PLATFORM_FEE: Record<SubscriptionTier, string> = {
  FREE: '15%',
  STARTER: '5%',
  BUSINESS: '2%',
};

// ==========================================
// VERIFY POLLING CONFIG
// ==========================================

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 60000;

type VerifyState = 'idle' | 'verifying' | 'reconciling' | 'completed' | 'failed';

// ==========================================
// HELPERS
// ==========================================

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getDaysRemaining(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ==========================================
// PAGE
// ==========================================

export default function SubscriptionPage() {
  const t = useTranslations('dashboard.subscription');
  const tToast = useTranslations('toast.subscription');

  const searchParams = useSearchParams();
  const [planInfo, setPlanInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Verify flow state
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  // [PHASE 3] Capture initial sessionId — used to decide whether to run
  // the Stripe reconcile fallback. Stable across the polling lifetime
  // even after we strip the URL on success.
  const sessionIdRef = useRef<string | null>(null);

  // ── Build plan config with i18n-aware copy ──────────────────
  const PLAN_CONFIG = useMemo(
    () =>
      ({
        FREE: {
          name: t('plans.FREE.name'),
          price: PLAN_STATIC.FREE.price,
          priceNote: t('plans.FREE.priceNote'),
          icon: PLAN_STATIC.FREE.icon,
          features: t.raw('plans.FREE.features') as string[],
          digitalFeatures: t.raw('plans.FREE.digitalFeatures') as string[],
        },
        STARTER: {
          name: t('plans.STARTER.name'),
          price: PLAN_STATIC.STARTER.price,
          priceNote: t('plans.STARTER.priceNote'),
          icon: PLAN_STATIC.STARTER.icon,
          features: t.raw('plans.STARTER.features') as string[],
          digitalFeatures: t.raw('plans.STARTER.digitalFeatures') as string[],
        },
        BUSINESS: {
          name: t('plans.BUSINESS.name'),
          price: PLAN_STATIC.BUSINESS.price,
          priceNote: t('plans.BUSINESS.priceNote'),
          icon: PLAN_STATIC.BUSINESS.icon,
          features: t.raw('plans.BUSINESS.features') as string[],
          digitalFeatures: t.raw('plans.BUSINESS.digitalFeatures') as string[],
        },
      }) satisfies Record<
        SubscriptionTier,
        {
          name: string;
          price: string;
          priceNote: string;
          icon: typeof Rocket;
          features: string[];
          digitalFeatures: string[];
        }
      >,
    [t],
  );

  // Marker for "forever free" so we know not to append the priceNote twice
  const freeForeverNote = t('plans.FREE.priceNote');

  // ── Fetch data ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      const plan = await subscriptionApi.getMyPlan();
      setPlanInfo(plan);
    } catch (err) {
      console.error('Failed to fetch subscription:', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stop polling helper ─────────────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ── Reconcile fallback (Stripe-only) ────────────────────────
  const runReconcile = useCallback(async () => {
    setVerifyState('reconciling');
    try {
      const result = await subscriptionApi.reconcile();
      if (result.reconciled && result.tier && result.tier !== 'FREE') {
        setVerifyState('completed');
        await fetchData();
        toast.success(tToast('reconcileSuccess'), {
          description: tToast('reconcileSuccessDetail', { tier: result.tier }),
        });
      } else {
        // Reconcile says still FREE → webhook never processed, payment may have failed
        setVerifyState('failed');
        toast.error(tToast('verificationFailed'), {
          description: tToast('verificationFailedDetail'),
        });
      }
    } catch (err) {
      setVerifyState('failed');
      toast.error(tToast('reconcileFailed'), { description: getErrorMessage(err) });
    }
  }, [fetchData, tToast]);

  // ── Handle return from checkout (Stripe OR LemonSqueezy) ────
  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (status === 'canceled') {
      toast.info(tToast('paymentCanceled'));
      window.history.replaceState({}, '', '/dashboard/subscription');
      return;
    }

    // [PHASE 3] LS redirect URL has no session_id. Only require ?status=success.
    if (status !== 'success') return;

    // Capture sessionId for later — survives URL cleanup on success
    sessionIdRef.current = sessionId;

    // Start polling
    setVerifyState('verifying');
    pollStartRef.current = Date.now();

    const poll = async () => {
      // Timeout check
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
        stopPolling();
        if (sessionIdRef.current) {
          // Stripe path — try reconcile as fallback
          await runReconcile();
        } else {
          // LS path — no reconcile available
          setVerifyState('failed');
          toast.error(tToast('verificationFailed'), {
            description: tToast('verificationFailedDetail'),
          });
        }
        return;
      }

      try {
        // [PHASE 3] verify() accepts optional sessionId; LS path passes undefined
        const result = await subscriptionApi.verify(
          sessionIdRef.current ?? undefined,
        );

        if (result.status === 'completed') {
          stopPolling();
          setVerifyState('completed');
          await fetchData();

          // Resolve tier from any of the response shapes (Stripe vs LS)
          const completedTier =
            result.subscription?.tier ?? result.tier ?? null;

          toast.success(tToast('paymentSuccess'), {
            description: completedTier
              ? tToast('paymentSuccessDetail', { tier: completedTier })
              : tToast('paymentSuccessGeneric'),
          });
          // Clean URL after success
          window.history.replaceState({}, '', '/dashboard/subscription');
        }
        // pending → keep polling
      } catch {
        // Network hiccup — keep polling, timeout will catch persistent failure
      }
    };

    // Immediate first check
    poll();
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return stopPolling;
  }, [searchParams, fetchData, runReconcile, stopPolling, tToast]);

  // ── Handlers ────────────────────────────────────────────────
  const handleCheckout = async (tier: 'STARTER' | 'BUSINESS') => {
    setCheckoutLoading(tier);
    try {
      const { checkoutUrl } = await subscriptionApi.createCheckout(tier);
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setCheckoutLoading(null);
    }
  };

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const result = await subscriptionApi.cancelSubscription();
      toast.success(result.message);
      setCancelDialogOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCanceling(false);
    }
  };

  const handleManualRetry = async () => {
    setVerifyState('verifying');
    try {
      const result = await subscriptionApi.verify(
        sessionIdRef.current ?? undefined,
      );
      if (result.status === 'completed') {
        setVerifyState('completed');
        await fetchData();
        return;
      }
      // Still pending → for Stripe path, escalate to reconcile
      if (sessionIdRef.current) {
        await runReconcile();
      } else {
        // LS path: nothing more we can do
        setVerifyState('failed');
        toast.error(tToast('verificationFailed'), {
          description: tToast('verificationFailedDetail'),
        });
      }
    } catch (err) {
      setVerifyState('failed');
      toast.error(tToast('reconcileFailed'), { description: getErrorMessage(err) });
    }
  };

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-11 w-full bg-muted animate-pulse rounded" />
            <div className="h-11 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const tier = planInfo?.tier ?? 'FREE';
  const status = planInfo?.status;
  const periodEnd = planInfo?.periodEnd;
  const daysRemaining = periodEnd ? getDaysRemaining(periodEnd) : null;
  const businessQualified = planInfo?.businessQualified ?? false;
  const salesTrack = planInfo?.salesTrack ?? { totalAmount: 0, totalCount: 0 };
  const usage = planInfo?.usage ?? { products: 0, digitalProducts: 0, storageMb: 0 };
  const limits = planInfo?.limits;
  const isAtLimit = planInfo?.isAtLimit;

  const currentPlan = PLAN_CONFIG[tier];
  const PlanIcon = currentPlan.icon;
  const isFreeForever = currentPlan.priceNote === freeForeverNote;

  // [PHASE 3] Show comingSoon badge on digital features when feature is off
  const showDigitalBadge = !FEATURES.digitalProducts;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* ── Verify Banner ──────────────────────────────────── */}
      {verifyState === 'verifying' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <strong>{t('verify.verifyingTitle')}</strong>{' '}
            {t('verify.verifyingBody')}
          </AlertDescription>
        </Alert>
      )}

      {verifyState === 'reconciling' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <strong>{t('verify.reconcilingTitle')}</strong>{' '}
            {t('verify.reconcilingBody')}
          </AlertDescription>
        </Alert>
      )}

      {verifyState === 'completed' && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-300">
            <strong>{t('verify.completedTitle')}</strong>{' '}
            {t('verify.completedBody')}
          </AlertDescription>
        </Alert>
      )}

      {verifyState === 'failed' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <strong>{t('verify.failedTitle')}</strong>{' '}
              {t('verify.failedBody')}{' '}
              <a href={`mailto:${t('verify.supportEmail')}`} className="underline font-medium">
                {t('verify.supportEmail')}
              </a>
              .
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualRetry}
              className="mt-2"
            >
              {t('verify.retryButton')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Over-Limit Banner ──────────────────────────────── */}
      {(isAtLimit?.products || (FEATURES.digitalProducts && isAtLimit?.digitalProducts)) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  {t('overLimit.titlePattern', { planName: currentPlan.name })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAtLimit?.products &&
                    t('overLimit.productsPart', {
                      used: usage.products,
                      max: limits?.maxProducts ?? 0,
                    })}
                  {FEATURES.digitalProducts && isAtLimit?.digitalProducts &&
                    t('overLimit.digitalProductsPart', {
                      used: usage.digitalProducts,
                      max: limits?.maxDigitalProducts ?? 0,
                    })}
                  {t('overLimit.suffix')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Current Plan Card ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlanIcon className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>{currentPlan.name} {t('planSuffix')}</CardTitle>
                <CardDescription>
                  {currentPlan.price}
                  {!isFreeForever
                    ? currentPlan.priceNote
                    : ` — ${currentPlan.priceNote}`}
                </CardDescription>
              </div>
            </div>
            <Badge
              variant={
                status === 'ACTIVE'
                  ? 'default'
                  : status === 'PAST_DUE'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {status === 'ACTIVE'
                ? t('badge.active')
                : status === 'PAST_DUE'
                  ? t('badge.pastDue')
                  : status === 'CANCELED'
                    ? t('badge.canceled')
                    : t('badge.free')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage tiles — digital + storage hidden when feature flag off */}
          {limits && (
            <div
              className={
                FEATURES.digitalProducts
                  ? 'grid grid-cols-1 sm:grid-cols-3 gap-3'
                  : 'grid grid-cols-1 gap-3'
              }
            >
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{t('usage.products')}</p>
                <p className="text-lg font-bold">
                  {usage.products}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' / '}
                    {limits.maxProducts >= 999 ? t('usage.infinity') : limits.maxProducts}
                  </span>
                </p>
              </div>

              {FEATURES.digitalProducts && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{t('usage.digital')}</p>
                  <p className="text-lg font-bold">
                    {usage.digitalProducts}
                    <span className="text-sm font-normal text-muted-foreground">
                      {' / '}
                      {limits.maxDigitalProducts >= 999
                        ? t('usage.infinity')
                        : limits.maxDigitalProducts}
                    </span>
                  </p>
                </div>
              )}

              {FEATURES.digitalProducts && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{t('usage.storage')}</p>
                  <p className="text-lg font-bold">
                    {(usage.storageMb / 1024).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {' / '}
                      {limits.maxStorageGb} GB
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Period countdown */}
          {tier !== 'FREE' && periodEnd && daysRemaining !== null && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {t('activeUntil', { date: formatDate(periodEnd), days: daysRemaining })}
              </span>
            </div>
          )}

          {/* Cancel button — paid plans only */}
          {tier !== 'FREE' && status === 'ACTIVE' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => setCancelDialogOpen(true)}
            >
              {t('cancel')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* ── Plan Comparison ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          Object.entries(PLAN_CONFIG) as [
            SubscriptionTier,
            (typeof PLAN_CONFIG)[SubscriptionTier],
          ][]
        ).map(([planTier, config]) => {
          const Icon = config.icon;
          const isCurrent = planTier === tier;
          const isUpgrade =
            (tier === 'FREE' &&
              (planTier === 'STARTER' || planTier === 'BUSINESS')) ||
            (tier === 'STARTER' && planTier === 'BUSINESS');
          const isDowngrade =
            (tier === 'BUSINESS' &&
              (planTier === 'STARTER' || planTier === 'FREE')) ||
            (tier === 'STARTER' && planTier === 'FREE');

          const businessLocked =
            planTier === 'BUSINESS' &&
            tier !== 'BUSINESS' &&
            !businessQualified &&
            tier === 'STARTER';
          const businessNeedStarter =
            planTier === 'BUSINESS' && tier === 'FREE';

          const planIsFreeForever = config.priceNote === freeForeverNote;

          return (
            <Card
              key={planTier}
              className={isCurrent ? 'border-primary ring-1 ring-primary/20' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{config.name}</CardTitle>
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-bold">{config.price}</span>
                  <span className="text-sm text-muted-foreground">
                    {!planIsFreeForever ? config.priceNote : ''}
                  </span>
                </div>
                {planTier === 'FREE' && (
                  <p className="text-xs text-muted-foreground">
                    {t('plans.FREE.priceNote')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                {/* Physical features — always rendered */}
                <ul className="space-y-2">
                  {config.features.map((feature, i) => (
                    <li key={`f-${i}`} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}

                  {/* [PHASE 3] Digital features — dimmed + Coming Soon badge when off */}
                  {config.digitalFeatures.map((feature, i) => (
                    <li
                      key={`d-${i}`}
                      className={
                        showDigitalBadge
                          ? 'flex items-start gap-2 text-sm text-muted-foreground'
                          : 'flex items-start gap-2 text-sm'
                      }
                    >
                      <Check
                        className={
                          showDigitalBadge
                            ? 'h-4 w-4 shrink-0 mt-0.5'
                            : 'h-4 w-4 text-primary shrink-0 mt-0.5'
                        }
                      />
                      <span className="flex-1">
                        {feature}
                        {showDigitalBadge && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[10px] py-0 h-4 align-middle"
                          >
                            {t('comingSoonBadge')}
                          </Badge>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    {t('platformFee.label')}{' '}
                    <span className="font-semibold text-foreground">
                      {PLATFORM_FEE[planTier]}
                    </span>
                  </p>
                </div>

                {isCurrent && (
                  <Button className="w-full" disabled>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    {t('cta.currentPlan')}
                  </Button>
                )}

                {isUpgrade && planTier === 'STARTER' && (
                  <Button
                    className="w-full"
                    onClick={() => handleCheckout('STARTER')}
                    disabled={!!checkoutLoading || verifyState === 'verifying'}
                  >
                    {checkoutLoading === 'STARTER' ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Zap className="h-4 w-4 mr-2" />
                    )}
                    {t('cta.upgradeStarter')}
                  </Button>
                )}

                {isUpgrade &&
                  planTier === 'BUSINESS' &&
                  !businessLocked &&
                  !businessNeedStarter && (
                    <Button
                      className="w-full"
                      onClick={() => handleCheckout('BUSINESS')}
                      disabled={!!checkoutLoading || verifyState === 'verifying'}
                    >
                      {checkoutLoading === 'BUSINESS' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="h-4 w-4 mr-2" />
                      )}
                      {t('cta.upgradeBusiness')}
                    </Button>
                  )}

                {businessNeedStarter && (
                  <Button className="w-full" variant="outline" disabled>
                    {t('cta.requiresStarterFirst')}
                  </Button>
                )}

                {businessLocked && (
                  <Button className="w-full" variant="outline" disabled>
                    {t('cta.notYetQualified')}
                  </Button>
                )}

                {isDowngrade && (
                  <Button className="w-full" variant="ghost" disabled>
                    <X className="h-4 w-4 mr-2" />
                    {t('cta.downgrade')}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Business Qualification Progress ────────────────── */}
      {tier === 'STARTER' && !businessQualified && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              {t('businessUnlock.title')}
            </CardTitle>
            <CardDescription>
              {t('businessUnlock.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('businessUnlock.totalSales')}
                </span>
                <span className="font-medium">
                  {t('businessUnlock.totalSalesValue', {
                    amount: salesTrack.totalAmount.toFixed(2),
                  })}
                </span>
              </div>
              <Progress
                value={Math.min(100, (salesTrack.totalAmount / 200) * 100)}
                className="h-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground">
                {t('businessUnlock.or')}
              </span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('businessUnlock.totalTransactions')}
                </span>
                <span className="font-medium">
                  {t('businessUnlock.totalTransactionsValue', {
                    count: salesTrack.totalCount,
                  })}
                </span>
              </div>
              <Progress
                value={Math.min(100, (salesTrack.totalCount / 20) * 100)}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Cancel Dialog ──────────────────────────────────── */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('cancelDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('cancelDialog.descriptionPrefix')}
              {periodEnd && t('cancelDialog.descriptionPeriodSuffix', {
                date: formatDate(periodEnd),
              })}
              {t('cancelDialog.descriptionSuffix')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>
              {t('cancelDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('cancelDialog.canceling')}
                </>
              ) : (
                t('cancelDialog.confirm')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
