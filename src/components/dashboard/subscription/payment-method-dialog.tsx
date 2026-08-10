'use client';

// ============================================================================
// PAYMENT METHOD DIALOG — pilih QRIS (Tripay) atau Kartu (LemonSqueezy)
// File: src/components/dashboard/subscription/payment-method-dialog.tsx
// ============================================================================
//
// Dua provider, dua karakter yang BERBEDA — dan perbedaannya wajib terlihat
// sebelum seller memilih, bukan setelah:
//
//   QRIS (Tripay)  → sekali bayar, TIDAK diperpanjang otomatis.
//   Kartu (LS)     → berulang otomatis, bisa dibatalkan kapan saja.
//
// Menyembunyikan perbedaan ini menghasilkan dua keluhan yang sama-sama
// mahal: seller QRIS yang mengira langganannya jalan terus lalu kaget
// aksesnya berhenti, dan seller kartu yang mengira sekali bayar lalu kaget
// tertagih lagi bulan depan.
//
// Label harga dibaca dari i18n `subscription.plans.{TIER}.price` yang SUDAH
// ADA — tidak diduplikat ke konstanta baru.
//
// [FEATURE FLAG — Aug 2026]
// Metode Kartu (LemonSqueezy) dikontrol oleh FEATURES.cardPayment.
// Saat false → hanya QRIS yang tampil (Tripay).
// Saat true  → kedua metode tersedia.
// Untuk mengaktifkan: set NEXT_PUBLIC_CARD_PAYMENT_ENABLED=true di env
// lalu rebuild. Pastikan backend LS credentials sudah terkonfigurasi.

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CreditCard, Info, Loader2, QrCode, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { subscriptionApi, type SubscriptionTier } from '@/lib/api/subscription';
import { getErrorMessage } from '@/lib/api/client';
import { useTripayCheckout } from '@/hooks/dashboard/use-tripay-checkout';
import { FEATURES } from '@/lib/config/features';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Tier yang akan dibeli. null = dialog tidak menampilkan apa-apa. */
  tier: Exclude<SubscriptionTier, 'FREE'> | null;
}

export function PaymentMethodDialog({ open, onOpenChange, tier }: Props) {
  // Namespace induk — supaya bisa membaca `plans.*` yang sudah ada
  // sekaligus `paymentMethod.*` yang baru.
  const t = useTranslations('dashboard.subscription');
  const { startCheckout, resetIntent, isLoading: tripayLoading } =
    useTripayCheckout();
  const [lsLoading, setLsLoading] = useState(false);

  if (!tier) return null;

  const planName = t(`plans.${tier}.name`);
  const planPrice = t(`plans.${tier}.price`);

  const handleTripay = async () => {
    await startCheckout(tier);
    // Dialog ditutup oleh navigasi ke halaman tunggu. Kalau gagal, hook
    // sudah menampilkan toast dan dialog sengaja dibiarkan terbuka supaya
    // seller bisa mencoba metode lain.
  };

  const handleLemonSqueezy = async () => {
    setLsLoading(true);
    try {
      const { checkoutUrl } = await subscriptionApi.createCheckout(tier);
      // Full redirect — halaman checkout ada di domain LemonSqueezy.
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setLsLoading(false);
    }
  };

  // busy mempertimbangkan lsLoading hanya kalau cardPayment aktif,
  // tapi tetap dihitung supaya tidak ada stale state kalau flag dinyalakan.
  const busy = tripayLoading || lsLoading;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Menutup dialog = meninggalkan niat bayar ini. Kunci idempotency
        // direset supaya percobaan berikutnya dianggap niat BARU, bukan
        // ulangan yang mengembalikan QR lama.
        if (!next) resetIntent();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('paymentMethod.title', { tier: planName })}</DialogTitle>
          <DialogDescription>
            {t('paymentMethod.descriptionWithPrice', { price: planPrice })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* ── QRIS ─────────────────────────────────────────────── */}
          <button
            type="button"
            onClick={() => void handleTripay()}
            disabled={busy}
            className="w-full rounded-lg border p-4 text-left transition hover:border-primary hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                {tripayLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : (
                  <QrCode className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{t('paymentMethod.qris.title')}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {t('paymentMethod.qris.subtitle')}
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  {t('paymentMethod.qris.noAutoRenew')}
                </p>
              </div>
            </div>
          </button>

          {/* ── Kartu / LemonSqueezy ─────────────────────────────── */}
          {/* [FEATURE FLAG] Dikontrol NEXT_PUBLIC_CARD_PAYMENT_ENABLED  */}
          {/* Untuk mengaktifkan: set flag ke "true" + rebuild.          */}
          {FEATURES.cardPayment && (
            <button
              type="button"
              onClick={() => void handleLemonSqueezy()}
              disabled={busy}
              className="w-full rounded-lg border p-4 text-left transition hover:border-primary hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  {lsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{t('paymentMethod.card.title')}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t('paymentMethod.card.subtitle')}
                  </p>
                  <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3" />
                    {t('paymentMethod.card.autoRenew')}
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => onOpenChange(false)}
          disabled={busy}
        >
          {t('paymentMethod.cancel')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}