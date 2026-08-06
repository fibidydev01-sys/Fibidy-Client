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
//
// [UI/UX — Aug 2026] Satu-satunya sumber kebenaran untuk semua UI yang
// mengasumsikan digital checkout (tier BUSINESS, businessUnlock progress
// card, baris platformFee) adalah FEATURES.digitalProducts — TIDAK ada
// flag/kondisi lain yang dibuat untuk ini. Alasan BUSINESS ikut disembunyikan
// total (bukan cuma unlock-gate-nya): salesTrack cuma valid kalau checkout
// tercatat otomatis lewat Stripe, jadi selama flag mati, BUSINESS tidak
// punya sumber data yang sah untuk fitur pembanding tier ini. Flag off →
// cuma FREE dan STARTER yang tampil di grid perbandingan.

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { FEATURES } from '@/lib/config/features';
import { EduRestrictedPage } from '@/components/dashboard/shared/edu-restricted-page';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface SubscriptionPageContentProps {
  // Provided when embedded inline in Settings (clears the ?section= query
  // param instead of navigating away). Standalone /dashboard/subscription
  // falls back to routing back to Settings itself.
  onBack?: () => void;
}

export function SubscriptionPageContent({ onBack }: SubscriptionPageContentProps = {}) {
  const t = useTranslations('dashboard.subscription');
  const queryClient = useQueryClient();
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);
  const handleBack = onBack ?? (() => router.push('/dashboard/settings'));

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
    return <EduRestrictedPage type="subscription" backPath="/dashboard/settings" />;
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
      <div className="h-full flex flex-col max-w-2xl mx-auto w-full">
        <div className="flex-1 pb-20 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
        <WizardNav onBack={handleBack} hideSaveButton />
      </div>
    );
  }

  const threshold = data?.businessThreshold;

  // Single source of truth for "does BUSINESS exist as an option right now":
  // FEATURES.digitalProducts. No separate flag for this.
  const visibleTiers = FEATURES.digitalProducts
    ? TIER_ORDER
    : TIER_ORDER.filter((tier) => tier !== 'BUSINESS');

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto w-full">
      <div className="flex-1 pb-20 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <SubscriptionStatusCard
        info={data}
        onCancel={() => void handleCancel()}
        cancelLoading={cancelLoading}
      />

      {/* Progress unlock BUSINESS — hanya render saat digital checkout aktif.
          salesTrack cuma valid kalau tercatat otomatis dari checkout Stripe;
          selama checkout satu-satunya adalah WA manual, tidak ada sumber
          data yang bisa dipercaya untuk fitur ini (self-report bisa
          diakalin, otomatis mustahil tanpa pencatatan transaksi yang
          memang sengaja tidak kita simpan). */}
      {FEATURES.digitalProducts && currentTier === 'STARTER' && !data?.businessQualified && threshold && (
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

      {/* Perbandingan tier — BUSINESS disembunyikan total selama digital
          checkout mati (lihat header komentar file ini). */}
      <div className={`grid gap-4 ${FEATURES.digitalProducts ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {visibleTiers.map((tier) => {
          const isCurrent = tier === currentTier;
          const isUpgrade =
            TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier);

          // BUSINESS terkunci sampai syarat penjualan terpenuhi.
          // Angkanya dari respons API — tidak pernah di-hardcode.
          // (Hanya relevan saat FEATURES.digitalProducts true — kalau tidak,
          // BUSINESS sudah difilter keluar dari visibleTiers di atas dan
          // baris-baris ini tidak pernah tereksekusi untuk tier itu.)
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

                {/* Only shown when Stripe checkout (digital products) is on — this fee applies to that flow, not manual WhatsApp orders. */}
                {FEATURES.digitalProducts && (
                  <div className="flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">
                      {t('platformFee.label')}
                    </span>
                    <span className="font-medium">{t(`platformFee.${tier}`)}</span>
                  </div>
                )}

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
      </div>

      <WizardNav onBack={handleBack} hideSaveButton />

      <PaymentMethodDialog
        open={payDialogTier !== null}
        onOpenChange={(open) => !open && setPayDialogTier(null)}
        tier={payDialogTier}
      />
    </div>
  );
}
