'use client';

// ============================================================================
// SUBSCRIPTION PAGE CONTENT
// File: src/components/dashboard/subscription/subscription-page-content.tsx
// ============================================================================
//
// Client component — di sinilah auth store dan TanStack Query dibaca.
// Halaman route-nya (page.tsx) tetap server component.
//
// Seluruh teks memakai key i18n yang SUDAH ADA di
// `dashboard.subscription.*` — `plans`, `cta`, `badge`, `usage`,
// `businessUnlock`, `platformFee`. Tidak ada namespace tandingan.

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import { EduRestrictedPage } from '@/components/dashboard/shared/edu-restricted-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/shared/query-keys';
import { subscriptionApi, type SubscriptionTier } from '@/lib/api/subscription';
import { getErrorMessage, ApiRequestError } from '@/lib/api/client';
import { formatIdr } from '@/lib/constants/dashboard/pricing';
import { SubscriptionStatusCard } from './subscription-status-card';
import { PaymentMethodDialog } from './payment-method-dialog';

const TIER_ORDER: SubscriptionTier[] = ['FREE', 'STARTER', 'BUSINESS'];

const TIER_ICON = {
  FREE: Sparkles,
  STARTER: Zap,
  BUSINESS: Crown,
} as const;

export function SubscriptionPageContent() {
  const t = useTranslations('dashboard.subscription');
  const queryClient = useQueryClient();
  const tenant = useAuthStore((s) => s.tenant);

  const [payDialogTier, setPayDialogTier] = useState<
    Exclude<SubscriptionTier, 'FREE'> | null
  >(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subscription.plan(),
    queryFn: () => subscriptionApi.getMyPlan(),
    staleTime: 1000 * 60 * 2,
  });

  // EDU restriction — dirender DI TEMPAT konten, bukan redirect diam-diam.
  if (tenant?.isEduMode === true) {
    return <EduRestrictedPage type="subscription" />;
  }

  const currentTier: SubscriptionTier = data?.tier ?? 'FREE';

  const handleCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await subscriptionApi.cancelSubscription();
      toast.success(res.message);
      void queryClient.invalidateQueries({
        queryKey: queryKeys.subscription.plan(),
      });
    } catch (err) {
      // ⚠️ TRIPAY_NO_AUTORENEW BUKAN KEGAGALAN.
      //
      // Backend membalas 400 dengan kode ini untuk tenant yang aktivasinya
      // lewat QRIS: langganannya memang tidak diperpanjang otomatis, jadi
      // tidak ada yang perlu dibatalkan. Menampilkannya sebagai toast merah
      // membuat seller mengira ada yang rusak padahal jawabannya justru
      // menenangkan.
      if (err instanceof ApiRequestError && err.code === 'TRIPAY_NO_AUTORENEW') {
        toast.info(err.message || t('provider.qrisNoAutoRenewToast'));
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setCancelLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const threshold = data?.businessThreshold;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <SubscriptionStatusCard
        info={data}
        onCancel={() => void handleCancel()}
        cancelLoading={cancelLoading}
      />

      {/* Progress unlock BUSINESS — hanya relevan untuk seller STARTER */}
      {currentTier === 'STARTER' && !data?.businessQualified && threshold && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('businessUnlock.title')}
            </CardTitle>
            <p className="pt-1 text-sm text-muted-foreground">
              {t('businessUnlock.description')}
            </p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t('businessUnlock.totalSales')}
              </span>
              <span className="font-medium">
                {t('businessUnlock.totalSalesValue', {
                  amount: formatIdr(data?.salesTrack.totalAmount ?? 0),
                  threshold: formatIdr(threshold.amountIdr),
                })}
              </span>
            </div>
            <p className="text-center text-xs uppercase text-muted-foreground">
              {t('businessUnlock.or')}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {t('businessUnlock.totalTransactions')}
              </span>
              <span className="font-medium">
                {t('businessUnlock.totalTransactionsValue', {
                  count: data?.salesTrack.totalCount ?? 0,
                  threshold: threshold.txCount,
                })}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Perbandingan tier */}
      <div className="grid gap-4 md:grid-cols-3">
        {TIER_ORDER.map((tier) => {
          const isCurrent = tier === currentTier;
          const isUpgrade =
            TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier);

          // BUSINESS terkunci sampai syarat penjualan terpenuhi.
          // Angkanya dari respons API — tidak pernah di-hardcode.
          const needsStarterFirst = tier === 'BUSINESS' && currentTier === 'FREE';
          const notQualified =
            tier === 'BUSINESS' &&
            currentTier === 'STARTER' &&
            !data?.businessQualified;
          const locked = needsStarterFirst || notQualified;

          const Icon = TIER_ICON[tier];
          const features = t.raw(`plans.${tier}.features`) as string[];

          return (
            <Card
              key={tier}
              className={isCurrent ? 'border-primary ring-1 ring-primary' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">
                      {t(`plans.${tier}.name`)}
                    </CardTitle>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {t('cta.currentPlan')}
                    </span>
                  )}
                </div>

                <p className="pt-2 text-2xl font-semibold">
                  {t(`plans.${tier}.price`)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}
                    {t(`plans.${tier}.priceNote`)}
                  </span>
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-muted-foreground">
                    {t('platformFee.label')}
                  </span>
                  <span className="font-medium">{t(`platformFee.${tier}`)}</span>
                </div>

                {isUpgrade && (
                  <Button
                    className="w-full"
                    disabled={locked}
                    onClick={() =>
                      setPayDialogTier(tier as Exclude<SubscriptionTier, 'FREE'>)
                    }
                  >
                    {needsStarterFirst
                      ? t('cta.requiresStarterFirst')
                      : notQualified
                        ? t('cta.notYetQualified')
                        : tier === 'STARTER'
                          ? t('cta.upgradeStarter')
                          : t('cta.upgradeBusiness')}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <PaymentMethodDialog
        open={payDialogTier !== null}
        onOpenChange={(open) => !open && setPayDialogTier(null)}
        tier={payDialogTier}
      />
    </div>
  );
}
