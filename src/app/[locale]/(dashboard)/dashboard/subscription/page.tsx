'use client';

// ==========================================
// SUBSCRIPTION PAGE — Stripe Billing
//
// Tiers: FREE → STARTER → BUSINESS
// Flow:  Click Subscribe → Stripe Checkout → webhook → active
// Cancel: cancel_at_period_end → stays active until period end
// Business: STARTER + ($200 sales OR 20 transactions)
//
// [TIDUR-NYENYAK FIX #3] Success return flow is now:
//   1. Detect ?status=success&session_id=xxx in URL
//   2. Poll GET /subscription/verify?sessionId=xxx every 2s
//   3. On 'completed' → refetch plan, show success
//   4. On 60s timeout → call POST /subscription/reconcile as fallback
//   5. If reconcile also fails → ask user to contact support
// ==========================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
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

// ==========================================
// PLAN CONFIG — must match BE plan-limits.ts
// ==========================================

const PLAN_CONFIG: Record<
  SubscriptionTier,
  {
    name: string;
    price: string;
    priceNote: string;
    icon: typeof Rocket;
    features: string[];
  }
> = {
  FREE: {
    name: 'Free',
    price: '$0',
    priceNote: 'Forever free',
    icon: Rocket,
    features: [
      '5 products',
      '3 digital products',
      '0.5 GB storage',
      'Max 20 MB per file',
      '2 photos per product',
      '1 hero template',
    ],
  },
  STARTER: {
    name: 'Starter',
    price: '$5',
    priceNote: '/month',
    icon: Zap,
    features: [
      '20 products',
      '20 digital products',
      '1 GB storage',
      'Max 50 MB per file',
      '3 photos per product',
      '3 hero templates',
    ],
  },
  BUSINESS: {
    name: 'Business',
    price: '$15',
    priceNote: '/month',
    icon: Crown,
    features: [
      '50 products',
      '50 digital products',
      '20 GB storage',
      'Max 500 MB per file',
      '5 photos per product',
      'All hero templates',
    ],
  },
};

// ==========================================
// [FIX #3] VERIFY POLLING CONFIG
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
  const searchParams = useSearchParams();
  const [planInfo, setPlanInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // [FIX #3] Verify flow state
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

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

  // ── [FIX #3] Stop polling helper ────────────────────────────
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // ── [FIX #3] Reconcile fallback ─────────────────────────────
  const runReconcile = useCallback(async () => {
    setVerifyState('reconciling');
    try {
      const result = await subscriptionApi.reconcile();
      if (result.reconciled && result.tier !== 'FREE') {
        setVerifyState('completed');
        await fetchData();
        toast.success('Subscription active!', {
          description: `Your plan is now ${result.tier}.`,
        });
      } else {
        // Reconcile says still FREE → webhook never processed, payment might have failed
        setVerifyState('failed');
        toast.error('Verification failed', {
          description:
            'Please try again or contact support if you have already been charged.',
        });
      }
    } catch (err) {
      setVerifyState('failed');
      toast.error('Reconcile failed', { description: getErrorMessage(err) });
    }
  }, [fetchData]);

  // ── [FIX #3] Handle return from Stripe Checkout with polling ─
  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (status === 'canceled') {
      toast.info('Payment canceled.');
      window.history.replaceState({}, '', '/dashboard/subscription');
      return;
    }

    if (status !== 'success' || !sessionId) return;

    // Start polling
    setVerifyState('verifying');
    pollStartRef.current = Date.now();

    const poll = async () => {
      // Timeout check → fallback to reconcile
      if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
        stopPolling();
        await runReconcile();
        return;
      }

      try {
        const result = await subscriptionApi.verify(sessionId);

        if (result.status === 'completed') {
          stopPolling();
          setVerifyState('completed');
          await fetchData();
          toast.success('Payment successful!', {
            description: result.subscription
              ? `Your plan is now ${result.subscription.tier}.`
              : 'Your subscription is active.',
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
  }, [searchParams, fetchData, runReconcile, stopPolling]);

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
    setVerifyState('reconciling');
    await runReconcile();
  };

  // ── Loading ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">Manage your plan and billing</p>
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and billing</p>
      </div>

      {/* ── [FIX #3] Verify Banner ─────────────────────────── */}
      {verifyState === 'verifying' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <strong>Processing payment...</strong> Please wait a few seconds
            for your subscription to activate. Do not refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {verifyState === 'reconciling' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            <strong>Checking payment status with Stripe...</strong> This
            usually takes just a few seconds.
          </AlertDescription>
        </Alert>
      )}

      {verifyState === 'completed' && (
        <Alert className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-emerald-800 dark:text-emerald-300">
            <strong>Subscription active!</strong> Your plan has been upgraded.
            Enjoy your new features! 🎉
          </AlertDescription>
        </Alert>
      )}

      {verifyState === 'failed' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-2">
            <div>
              <strong>Payment verification failed.</strong> If your card has
              already been charged, the payment will be verified automatically
              within a few minutes. You can try again or contact support at{' '}
              <a href="mailto:admin@fibidy.com" className="underline font-medium">
                admin@fibidy.com
              </a>
              .
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualRetry}
              className="mt-2"
            >
              Retry verification
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Over-Limit Banner ──────────────────────────────── */}
      {(isAtLimit?.products || isAtLimit?.digitalProducts) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  {currentPlan.name} plan limit reached
                </p>
                <p className="text-sm text-muted-foreground">
                  {isAtLimit?.products &&
                    `Products: ${usage.products}/${limits?.maxProducts}. `}
                  {isAtLimit?.digitalProducts &&
                    `Digital products: ${usage.digitalProducts}/${limits?.maxDigitalProducts}. `}
                  Upgrade to increase capacity.
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
                <CardTitle>{currentPlan.name} Plan</CardTitle>
                <CardDescription>
                  {currentPlan.price}
                  {currentPlan.priceNote !== 'Forever free'
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
                ? 'Active'
                : status === 'PAST_DUE'
                  ? 'Payment Past Due'
                  : status === 'CANCELED'
                    ? 'Canceled'
                    : 'Free'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage */}
          {limits && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Products</p>
                <p className="text-lg font-bold">
                  {usage.products}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' / '}
                    {limits.maxProducts >= 999 ? '∞' : limits.maxProducts}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Digital</p>
                <p className="text-lg font-bold">
                  {usage.digitalProducts}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' / '}
                    {limits.maxDigitalProducts >= 999
                      ? '∞'
                      : limits.maxDigitalProducts}
                  </span>
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Storage</p>
                <p className="text-lg font-bold">
                  {(usage.storageMb / 1024).toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' / '}
                    {limits.maxStorageGb} GB
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Period countdown */}
          {tier !== 'FREE' && periodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Active until {formatDate(periodEnd)} ({daysRemaining} days left)
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
              Cancel subscription
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
                    {config.priceNote !== 'Forever free' ? config.priceNote : ''}
                  </span>
                </div>
                {planTier === 'FREE' && (
                  <p className="text-xs text-muted-foreground">Forever free</p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <ul className="space-y-2">
                  {config.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground">
                    Platform fee:{' '}
                    <span className="font-semibold text-foreground">
                      {planTier === 'FREE'
                        ? '15%'
                        : planTier === 'STARTER'
                          ? '5%'
                          : '2%'}
                    </span>
                  </p>
                </div>

                {isCurrent && (
                  <Button className="w-full" disabled>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Current plan
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
                    Upgrade to Starter
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
                      Upgrade to Business
                    </Button>
                  )}

                {businessNeedStarter && (
                  <Button className="w-full" variant="outline" disabled>
                    Requires Starter first
                  </Button>
                )}

                {businessLocked && (
                  <Button className="w-full" variant="outline" disabled>
                    Not yet qualified
                  </Button>
                )}

                {isDowngrade && (
                  <Button className="w-full" variant="ghost" disabled>
                    <X className="h-4 w-4 mr-2" />
                    Downgrade
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
              Business unlock progress
            </CardTitle>
            <CardDescription>
              Meet one of the requirements to unlock Business plan upgrade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total sales</span>
                <span className="font-medium">
                  ${salesTrack.totalAmount.toFixed(2)} / $200
                </span>
              </div>
              <Progress
                value={Math.min(100, (salesTrack.totalAmount / 200) * 100)}
                className="h-2"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total transactions</span>
                <span className="font-medium">{salesTrack.totalCount} / 20</span>
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
              Cancel subscription?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of the current
              billing period
              {periodEnd && ` (${formatDate(periodEnd)})`}. After that, your
              account will automatically downgrade to Free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={isCanceling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Canceling...
                </>
              ) : (
                'Yes, cancel'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}