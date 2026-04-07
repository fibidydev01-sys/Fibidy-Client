'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Rocket, Crown, Loader2, Calendar, Receipt, AlertTriangle, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { subscriptionApi, type SubscriptionInfo, type PaymentHistory } from '@/lib/api/subscription';
import { getErrorMessage } from '@/lib/api/client';

const PAYMENT_STATUS_LABELS: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'outline' }
> = {
  paid: { label: 'Paid', variant: 'default' },
  pending: { label: 'Pending', variant: 'outline' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function getDaysRemaining(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SubscriptionPage() {
  const [planInfo, setPlanInfo] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestingUpgrade, setRequestingUpgrade] = useState(false);

  const fetchData = async () => {
    try {
      const [plan, history] = await Promise.all([
        subscriptionApi.getMyPlan(),
        subscriptionApi.getPaymentHistory().catch(() => []),
      ]);
      setPlanInfo(plan);
      setPayments(history);
    } catch (err) {
      console.error('Failed to fetch subscription:', getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleContactWa = async () => {
    setRequestingUpgrade(true);
    try {
      const result = await subscriptionApi.requestUpgrade();
      window.open(result.waUrl, '_blank');
      await fetchData();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setRequestingUpgrade(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
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

  const plan = planInfo?.subscription.plan;
  const status = planInfo?.subscription.status;
  const isStarter = plan === 'STARTER';
  const isBusiness = plan === 'BUSINESS';
  const isActive = status === 'ACTIVE';
  const periodEnd = planInfo?.subscription.currentPeriodEnd;
  const daysRemaining = periodEnd ? getDaysRemaining(periodEnd) : null;
  const isPaidActiveBusiness = isBusiness && isActive;
  const hasPendingPayment = payments.some((p) => p.paymentStatus === 'pending');
  const showUpgrade = !isPaidActiveBusiness;
  const overLimitProducts = planInfo?.isOverLimit?.products ?? false;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and billing</p>
      </div>

      {/* Over-Limit Banner */}
      {isStarter && overLimitProducts && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-sm">
                  You&apos;ve exceeded your Starter plan limits
                </p>
                <p className="text-sm text-muted-foreground">
                  You have {planInfo?.usage.products} products (limit{' '}
                  {planInfo?.limits.maxProducts}). Your existing data is safe,
                  but you can&apos;t add new entries.
                </p>
                {!hasPendingPayment && (
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={handleContactWa}
                    disabled={requestingUpgrade}
                  >
                    {requestingUpgrade ? (
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    ) : (
                      <Crown className="mr-2 h-3 w-3" />
                    )}
                    Contact Sales — Rp 35,000/mo
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isStarter ? (
                <Rocket className="h-6 w-6 text-muted-foreground" />
              ) : (
                <Crown className="h-6 w-6 text-primary" />
              )}
              <div>
                <CardTitle>{plan} Plan</CardTitle>
                <CardDescription>
                  {isStarter ? 'Free forever' : 'Business Plan 35K'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={isPaidActiveBusiness ? 'default' : 'secondary'}>
              {isActive ? 'Active' : status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Usage Stats */}
          <div className="rounded-lg border p-3">
            <p className="text-sm text-muted-foreground">Products</p>
            <p className="text-lg font-bold">
              {planInfo?.usage.products}
              <span className="text-sm font-normal text-muted-foreground">
                {' / '}
                {(planInfo?.limits.maxProducts ?? 0) >= 999999
                  ? 'Unlimited'
                  : planInfo?.limits.maxProducts}
              </span>
            </p>
          </div>

          {/* Period countdown */}
          {isBusiness && periodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Active until {formatDate(periodEnd)} ({daysRemaining} days left)
              </span>
            </div>
          )}

          {/* Skenario 1: STARTER, belum pending → Contact Sales */}
          {showUpgrade && !hasPendingPayment && (
            <Button
              onClick={handleContactWa}
              className="w-full"
              size="lg"
              disabled={requestingUpgrade}
            >
              {requestingUpgrade ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Crown className="mr-2 h-4 w-4" />
              )}
              Contact Sales — Rp 35,000/mo
            </Button>
          )}

          {/* Skenario 2: STARTER, sudah pending → notice */}
          {showUpgrade && hasPendingPayment && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Pembayaran sedang diproses
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cek riwayat pembayaran di bawah untuk follow up.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment history
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => {
                const statusInfo = PAYMENT_STATUS_LABELS[payment.paymentStatus] ?? {
                  label: payment.paymentStatus,
                  variant: 'secondary' as const,
                };
                const isPending = payment.paymentStatus === 'pending';

                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Business Plan 35K —{' '}
                        {new Date(payment.periodStart).toLocaleDateString('en-US', {
                          month: 'short', year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString('en-US')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <Badge variant={statusInfo.variant} className="text-xs">
                        {statusInfo.label}
                      </Badge>

                      {isPending && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={handleContactWa}
                          disabled={requestingUpgrade}
                        >
                          {requestingUpgrade ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <MessageCircle className="mr-1 h-3 w-3" />
                          )}
                          Hubungi Admin
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}