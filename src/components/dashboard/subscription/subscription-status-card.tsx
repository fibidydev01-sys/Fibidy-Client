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
import { CalendarDays, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionInfo } from '@/lib/api/subscription';

interface Props {
  info: SubscriptionInfo | undefined;
}

export function SubscriptionStatusCard({
  info,
}: Props) {
  const t = useTranslations('dashboard.subscription');
  const format = useFormatter();

  if (!info || info.tier === 'FREE') {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-title-sm">{t('currentPlan')}</CardTitle>
            <Badge variant="outline">{t('badge.free')}</Badge>
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

  // [PANGKAS PRODUK DIGITAL] Pembayaran kartu dicabut — semua langganan
  // kini lewat QRIS, jadi tidak ada lagi percabangan provider.
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
          <CardTitle className="text-title-sm">
            {t('currentPlan')} — {t(`plans.${info.tier}.name`)}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{statusBadge}</Badge>
            <Badge variant="outline" className="gap-1.5">
              <QrCode className="h-3 w-3" />
              {t('provider.viaQris')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {periodEnd && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t('provider.activeUntilDate')}{' '}
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

        {/*
          Tidak ada tombol batalkan. Langganan QRIS tidak diperpanjang
          otomatis — tidak ada apapun yang perlu dibatalkan, dan menampilkan
          tombol yang pasti ditolak server hanya membuat seller mengira ada
          yang rusak.
        */}
        <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          {t('provider.qrisNotice')}
        </p>
      </CardContent>
    </Card>
  );
}
