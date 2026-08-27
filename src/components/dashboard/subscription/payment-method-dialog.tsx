'use client';

// ============================================================================
// PAYMENT METHOD DIALOG — konfirmasi bayar QRIS (Tripay)
// File: src/components/dashboard/subscription/payment-method-dialog.tsx
// ============================================================================
//
// [PANGKAS PRODUK DIGITAL] Pembayaran kartu (LemonSqueezy) dicabut; QRIS
// jadi satu-satunya metode.
//
// Dialog ini SENGAJA dipertahankan meski tinggal satu pilihan. Isinya bukan
// cuma tombol, tapi peringatan bahwa QRIS dibayar sekali dan TIDAK
// diperpanjang otomatis. Menghapus langkah ini menghasilkan keluhan yang
// mahal: seller yang mengira langganannya jalan terus, lalu kaget aksesnya
// berhenti.
//
// Label harga dibaca dari i18n `subscription.plans.{TIER}.price` yang SUDAH
// ADA — tidak diduplikat ke konstanta baru.

import { useTranslations } from 'next-intl';
import { Info, Loader2, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type SubscriptionTier } from '@/lib/api/subscription';
import { useTripayCheckout } from '@/hooks/dashboard/use-tripay-checkout';

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

  if (!tier) return null;

  const planName = t(`plans.${tier}.name`);
  const planPrice = t(`plans.${tier}.price`);

  const handleTripay = async () => {
    await startCheckout(tier);
    // Dialog ditutup oleh navigasi ke halaman tunggu. Kalau gagal, hook
    // sudah menampilkan toast dan dialog sengaja dibiarkan terbuka supaya
    // seller bisa mencoba lagi tanpa mengulang dari kartu harga.
  };

  const busy = tripayLoading;

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
