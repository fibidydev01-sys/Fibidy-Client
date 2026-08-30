'use client';

// ============================================================================
// SUBSCRIPTION PAGE CONTENT
// File: src/components/dashboard/subscription/subscription-page-content.tsx
// ============================================================================
//
// [MIGRASI — Aug 2026] WizardNav (floating bottom) → WizardHeader (sticky top).

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { EduRestrictedPage } from '@/components/dashboard/shared/edu-restricted-page';
import { WizardHeader } from '@/components/dashboard/shared/wizard-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { queryKeys } from '@/lib/shared/query-keys';
import { subscriptionApi, type SubscriptionTier } from '@/lib/api/subscription';
import { formatIdr } from '@/lib/constants/dashboard/pricing';
import { SubscriptionStatusCard } from './subscription-status-card';
import { PaymentMethodDialog } from './payment-method-dialog';
import { cn } from '@/lib/shared/utils';
import { PAGE_COLUMN } from '@/components/dashboard/shared/page-column';

const TIER_ORDER: SubscriptionTier[] = ['FREE', 'STARTER', 'BUSINESS'];

const TIER_ICON = {
  FREE: Sparkles,
  STARTER: Zap,
  BUSINESS: Crown,
} as const;

interface SubscriptionPageContentProps {
  onBack?: () => void;
}

export function SubscriptionPageContent({ onBack }: SubscriptionPageContentProps = {}) {
  const t = useTranslations('dashboard.subscription');
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);
  const handleBack = onBack ?? (() => router.push('/dashboard/settings'));

  const [payDialogTier, setPayDialogTier] = useState<
    Exclude<SubscriptionTier, 'FREE'> | null
  >(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.subscription.plan(),
    queryFn: () => subscriptionApi.getMyPlan(),
    staleTime: 1000 * 60 * 2,
  });

  if (tenant?.isEduMode === true) {
    return <EduRestrictedPage type="subscription" backPath="/dashboard/settings" />;
  }

  const currentTier: SubscriptionTier = data?.tier ?? 'FREE';

  if (isLoading) {
    return (
      <div className={cn(PAGE_COLUMN, 'space-y-6 pb-10')}>
        <WizardHeader onBack={handleBack} hideSaveButton />
        <div className="mt-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  const threshold = data?.businessThreshold;
  const visibleTiers = TIER_ORDER;

  return (
    <div className={cn(PAGE_COLUMN, 'pb-10')}>
      <WizardHeader onBack={handleBack} hideSaveButton />

      <div className="mt-6 space-y-6">
        <div>
          <h1 className="text-display-sm text-ink">{t('title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
        </div>

        <SubscriptionStatusCard info={data} />

        {currentTier !== 'BUSINESS' && !data?.businessQualified && threshold && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-title-sm">
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

        <div className="grid gap-4 md:grid-cols-3">
          {visibleTiers.map((tier) => {
            const isCurrent = tier === currentTier;
            const isUpgrade = TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier);
            const bisaPerpanjang = isCurrent && tier !== 'FREE';
            const notQualified = tier === 'BUSINESS' && !isCurrent && !data?.businessQualified;
            const locked = notQualified;
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
                      <CardTitle className="text-title-sm">
                        {t(`plans.${tier}.name`)}
                      </CardTitle>
                    </div>
                    {isCurrent && (
                      <Badge variant="secondary">{t('cta.currentPlan')}</Badge>
                    )}
                  </div>
                  <p className="pt-2 text-2xl font-semibold">
                    {t(`plans.${tier}.price`)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {' '}{t(`plans.${tier}.priceNote`)}
                    </span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-semantic-success" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {(isUpgrade || bisaPerpanjang) && (
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        variant={bisaPerpanjang ? 'outline' : 'default'}
                        disabled={locked}
                        onClick={() =>
                          setPayDialogTier(tier as Exclude<SubscriptionTier, 'FREE'>)
                        }
                      >
                        {bisaPerpanjang
                          ? t('cta.renew')
                          : notQualified
                            ? t('cta.notYetQualified')
                            : tier === 'STARTER'
                              ? t('cta.upgradeStarter')
                              : t('cta.upgradeBusiness')}
                      </Button>
                      {bisaPerpanjang && (data?.sisaHari ?? 0) > 0 && (
                        <p className="text-center text-xs text-muted-foreground">
                          {t('cta.renewCarryOver', { days: data!.sisaHari! })}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <PaymentMethodDialog
        open={payDialogTier !== null}
        onOpenChange={(open) => !open && setPayDialogTier(null)}
        tier={payDialogTier}
      />
    </div>
  );
}