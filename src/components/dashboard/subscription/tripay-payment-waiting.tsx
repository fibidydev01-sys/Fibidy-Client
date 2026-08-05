'use client';

// ============================================================================
// TRIPAY PAYMENT WAITING — QR + countdown + polling
// File: src/components/dashboard/subscription/tripay-payment-waiting.tsx
// ============================================================================

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  QrCode,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTripayPayment } from '@/hooks/dashboard/use-tripay-payment';
import { formatIdr } from '@/lib/constants/dashboard/pricing';

interface Props {
  paymentId: string;
}

export function TripayPaymentWaiting({ paymentId }: Props) {
  const t = useTranslations('dashboard.subscription.tripay');
  const router = useRouter();

  const {
    payment,
    isLoading,
    isError,
    status,
    isPaid,
    isCountdownElapsed,
    countdown,
    refetch,
  } = useTripayPayment(paymentId);

  // ── Loading awal ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-md p-4 sm:p-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="mx-auto h-64 w-64" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Gagal membaca status ────────────────────────────────────────────────
  // Sengaja TIDAK menyimpulkan apapun soal pembayaran. Kegagalan jaringan
  // bukan bukti tagihannya batal — seller diberi tombol coba lagi, bukan
  // pesan "pembayaran gagal" yang belum tentu benar.
  if (isError || !payment) {
    return (
      <div className="mx-auto max-w-md p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">{t('loadError')}</p>
            <Button onClick={() => void refetch()} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Lunas ───────────────────────────────────────────────────────────────
  if (isPaid) {
    return (
      <div className="mx-auto max-w-md p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{t('paidTitle')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('paidDescription', { tier: payment.tier })}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push('/dashboard/subscription')}
            >
              {t('backToSubscription')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Kedaluwarsa / gagal ─────────────────────────────────────────────────
  if (status === 'EXPIRED' || status === 'FAILED') {
    return (
      <div className="mx-auto max-w-md p-4 sm:p-6">
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">
                {status === 'EXPIRED' ? t('expiredTitle') : t('failedTitle')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {status === 'EXPIRED'
                  ? t('expiredDescription')
                  : (payment.failureReason ?? t('failedDescription'))}
              </p>
            </div>
            {/*
              Tidak ada tombol "coba lagi" di sini yang langsung membuat
              tagihan baru. Seller dikembalikan ke halaman subscription untuk
              memulai niat bayar baru secara sadar — supaya kunci idempotency
              yang baru memang mewakili niat yang baru, bukan ulangan dari
              yang lama.
            */}
            <Button
              className="w-full"
              onClick={() => router.push('/dashboard/subscription')}
            >
              {t('backToSubscription')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Menunggu pembayaran ─────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-md space-y-4 p-4 sm:p-6">
      <Link
        href="/dashboard/subscription"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t('back')}
      </Link>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{t('waitingTitle')}</CardTitle>
          <p className="pt-1 text-sm text-muted-foreground">
            {t('waitingDescription')}
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* QR */}
          {payment.qrUrl ? (
            <div className="flex justify-center">
              <div className="rounded-xl border bg-white p-3">
                <Image
                  src={payment.qrUrl}
                  alt={t('qrAlt')}
                  width={256}
                  height={256}
                  className="h-56 w-56 sm:h-64 sm:w-64"
                  unoptimized
                  priority
                />
              </div>
            </div>
          ) : (
            // QR belum terbit — bisa terjadi kalau create-transaction sempat
            // timeout. Backend membiarkan barisnya PENDING dan rekonsiliasi
            // yang akan menentukan nasibnya, jadi seller diberi tahu apa
            // adanya, bukan layar kosong.
            <div className="rounded-lg border border-dashed p-6 text-center">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t('qrPending')}
              </p>
            </div>
          )}

          {/* Nominal */}
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-xs text-muted-foreground">{t('amountLabel')}</p>
            <p className="text-2xl font-semibold">{formatIdr(payment.amount)}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('tierLabel', { tier: payment.tier })}
            </p>
          </div>

          {/* Countdown / status */}
          <div className="flex items-center justify-center gap-2 text-sm">
            {isCountdownElapsed ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                {/*
                  Countdown habis TAPI server belum bilang EXPIRED. Jam
                  perangkat bisa salah, dan callback dari Tripay mungkin masih
                  dalam perjalanan — jadi kita tidak mengumumkan kedaluwarsa
                  sendiri. Server yang memutuskan; polling tetap jalan.
                */}
                <span className="text-muted-foreground">{t('checking')}</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('expiresIn')}{' '}
                  <span className="font-mono font-medium text-foreground">
                    {countdown ?? '--:--'}
                  </span>
                </span>
              </>
            )}
          </div>

          {/* Instruksi */}
          <ol className="space-y-1.5 text-sm text-muted-foreground">
            <li>1. {t('step1')}</li>
            <li>2. {t('step2')}</li>
            <li>3. {t('step3')}</li>
          </ol>

          <p className="text-center text-xs text-muted-foreground">
            {t('autoDetect')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
