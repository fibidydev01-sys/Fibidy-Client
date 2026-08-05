'use client';

// ============================================================================
// SUBSCRIPTION STATUS CARD
// File: src/components/dashboard/subscription/subscription-status-card.tsx
// ============================================================================
//
// Memakai key i18n yang SUDAH ADA (`badge.*`, `cancel`, `cancelling`,
// `currentPlan`, `plans.*`) + key baru `provider.*` untuk membedakan
// langganan Kartu vs QRIS.

import { useTranslations, useFormatter } from 'next-intl';
import { CalendarDays, CreditCard, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SubscriptionInfo } from '@/lib/api/subscription';

interface Props {
  info: SubscriptionInfo | undefined;
  onCancel: () => void;
  cancelLoading: boolean;
}

export function SubscriptionStatusCard({
  info,
  onCancel,
  cancelLoading,
}: Props) {
  const t = useTranslations('dashboard.subscription');
  const format = useFormatter();

  if (!info || info.tier === 'FREE') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t('currentPlan')}</CardTitle>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {t('badge.free')}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('plans.FREE.priceNote')}
          </p>
        </CardContent>
      </Card>
    );
  }

  /**
   * Provider ditentukan dari ADA-TIDAKNYA `lsSubscriptionId`.
   *
   * Backend sengaja TIDAK menulis apapun ke kolom `ls*` untuk aktivasi lewat
   * Tripay — jadi kolom kosong berarti "diaktifkan lewat QRIS". Penanda ini
   * bisa dipercaya justru karena backend disiplin tidak mengisinya dengan
   * nilai placeholder.
   */
  const isLemonSqueezy = Boolean(info.subscription?.lsSubscriptionId);
  const periodEnd = info.periodEnd ?? info.subscription?.currentPeriodEnd;

  const statusBadge =
    info.status === 'PAST_DUE'
      ? t('badge.pastDue')
      : info.status === 'CANCELED'
        ? t('badge.canceled')
        : t('badge.active');

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            {t('currentPlan')} — {t(`plans.${info.tier}.name`)}
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {statusBadge}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
              {isLemonSqueezy ? (
                <>
                  <CreditCard className="h-3 w-3" />
                  {t('provider.viaCard')}
                </>
              ) : (
                <>
                  <QrCode className="h-3 w-3" />
                  {t('provider.viaQris')}
                </>
              )}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {periodEnd && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {isLemonSqueezy
                ? t('provider.renewsOn')
                : t('provider.activeUntilDate')}{' '}
              <span className="font-medium text-foreground">
                {format.dateTime(new Date(periodEnd), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>
        )}

        {isLemonSqueezy ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t('provider.cardNotice')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={cancelLoading}
            >
              {cancelLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {cancelLoading ? t('cancelling') : t('cancel')}
            </Button>
          </div>
        ) : (
          /*
            Tenant QRIS TIDAK diberi tombol batalkan.
            Langganan QRIS tidak diperpanjang otomatis — tidak ada apapun
            yang perlu dibatalkan, dan menampilkan tombol yang pasti ditolak
            server hanya membuat seller mengira ada yang rusak.
          */
          <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            {t('provider.qrisNotice')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
