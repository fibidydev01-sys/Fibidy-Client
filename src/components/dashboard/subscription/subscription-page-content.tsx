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
// `businessUnlock`. Tidak ada namespace tandingan.
//
// [PANGKAS PRODUK DIGITAL] BUSINESS kembali tampil penuh. Dulu tier ini
// disembunyikan karena salesTrack hanya terisi dari checkout Stripe; kini
// angkanya datang dari omzet kasir (KasirTransaksi berstatus COMPLETED),
// sumber yang justru lebih tepat untuk UMKM. Baris platformFee dihapus —
// biaya per-transaksi itu milik checkout Stripe yang sudah tidak ada;
// pesanan lewat WhatsApp tidak pernah dikenai potongan.

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { EduRestrictedPage } from '@/components/dashboard/shared/edu-restricted-page';
import { WizardNav } from '@/components/dashboard/shared/wizard-nav';
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
  // Provided when embedded inline in Settings (clears the ?section= query
  // param instead of navigating away). Standalone /dashboard/subscription
  // falls back to routing back to Settings itself.
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

  // EDU restriction — dirender DI TEMPAT konten, bukan redirect diam-diam.
  if (tenant?.isEduMode === true) {
    return <EduRestrictedPage type="subscription" backPath="/dashboard/settings" />;
  }

  const currentTier: SubscriptionTier = data?.tier ?? 'FREE';


  if (isLoading) {
    return (
      <div className={cn('h-full flex flex-col', PAGE_COLUMN)}>
        {/* pb-20 (fixed-pill clearance) only matters below md; md:pb-6
            takes over from md up where WizardNav is `sticky`/in-flow and
            doesn't need an artificial reserve — see wizard-nav.tsx's v6
            note and contact.tsx's equivalent comment for the full story. */}
        <div className="flex-1 pb-20 md:pb-6 space-y-6">
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

  const visibleTiers = TIER_ORDER;

  return (
    <div className={cn('h-full flex flex-col', PAGE_COLUMN)}>
      {/* pb-20 (fixed-pill clearance) only matters below md; md:pb-6
          takes over from md up where WizardNav is `sticky`/in-flow and
          doesn't need an artificial reserve — see wizard-nav.tsx's v6
          note and contact.tsx's equivalent comment for the full story. */}
      <div className="flex-1 pb-20 md:pb-6 space-y-6">
      <div>
        <h1 className="text-display-sm text-ink">{t('title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <SubscriptionStatusCard info={data} />

      {/* Progress unlock BUSINESS.
          salesTrack diisi dari omzet kasir — transaksi berstatus COMPLETED,
          yaitu yang benar-benar sudah dibayar. Pesanan yang belum lunas,
          void, dan refund tidak ikut dihitung.

          FREE ikut melihatnya, bukan cuma STARTER. Sejak urutan pembelian
          tidak lagi jadi syarat, penjual FREE — termasuk yang baru turun dari
          BUSINESS — bisa langsung ke BUSINESS asal omzetnya memenuhi. Kalau
          kartu ini disembunyikan darinya, ia tidak punya cara tahu seberapa
          dekat dia. */}
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

      {/* Perbandingan tier — ketiganya tampil. */}
      <div className="grid gap-4 md:grid-cols-3">
        {visibleTiers.map((tier) => {
          const isCurrent = tier === currentTier;
          const isUpgrade =
            TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier);

          // Perpanjangan. Langganan di sini TIDAK diperpanjang otomatis —
          // satu-satunya cara melanjutkan adalah membayar lagi untuk tier
          // yang sama. Dulu tombolnya tidak ada sama sekali: kartu tier yang
          // sedang dipakai cuma menampilkan lencana "Paket saat ini", dan
          // penjual yang mau lanjut tidak punya tombol untuk menekannya.
          //
          // FREE tidak pernah habis, jadi tidak ada yang perlu diperpanjang.
          const bisaPerpanjang = isCurrent && tier !== 'FREE';

          // BUSINESS terkunci sampai syarat omzet kasir terpenuhi.
          // Angkanya dari respons API — tidak pernah di-hardcode.
          //
          // URUTAN PEMBELIAN BUKAN LAGI SYARAT. Dulu penjual FREE melihat
          // "Butuh Starter dulu" — termasuk penjual yang BARU SAJA turun dari
          // BUSINESS. Ia harus membeli STARTER dulu baru BUSINESS: dua
          // tagihan untuk kembali ke tempat yang sudah pernah dia tempati.
          // Server sudah tidak lagi mensyaratkannya (assertTierUpgradeAllowed),
          // jadi kartunya juga tidak boleh.
          const notQualified =
            tier === 'BUSINESS' && !isCurrent && !data?.businessQualified;
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
                    {' '}
                    {t(`plans.${tier}.priceNote`)}
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
                        setPayDialogTier(
                          tier as Exclude<SubscriptionTier, 'FREE'>,
                        )
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

                    {/* Sisa hari terbawa. Ini yang membuat perpanjangan lebih
                        awal aman — tanpa kalimat ini, penjual yang melihat
                        spanduk H-7 akan menduga bayar sekarang berarti
                        kehilangan tujuh hari yang sudah dia bayar. */}
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

      <WizardNav onBack={handleBack} hideSaveButton />

      <PaymentMethodDialog
        open={payDialogTier !== null}
        onOpenChange={(open) => !open && setPayDialogTier(null)}
        tier={payDialogTier}
      />
    </div>
  );
}
