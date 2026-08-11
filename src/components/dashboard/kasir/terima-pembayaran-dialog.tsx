'use client';

// ============================================================================
// TERIMA PEMBAYARAN
// File: src/components/dashboard/kasir/terima-pembayaran-dialog.tsx
//
// Langkah terakhir alur jasa: "Pelanggan Ambil + Bayar". Isinya sengaja
// dibuat sama dengan bagian pembayaran di keranjang — kasir mengerjakan hal
// yang persis sama (pilih metode, terima uang, hitung kembalian), cuma pada
// pesanan yang sudah tercatat sebelumnya. Dua tata letak berbeda untuk satu
// pekerjaan yang sama adalah beban hafalan yang tidak perlu.
//
// Sejak dialog ini berhasil, transaksinya masuk omzet HARI INI — bukan hari
// pesanan diterima.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Banknote, CreditCard, Landmark, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { getErrorMessage } from '@/lib/api/client';
import { useBayarTransaksi } from '@/hooks/dashboard/use-kasir';
import type { KasirPaymentMethod } from '@/types/kasir';

const NOMINAL_CEPAT = [5000, 10000, 20000, 50000, 100000];

const METODE: Array<{
  id: KasirPaymentMethod;
  icon: typeof Banknote;
  labelKey: string;
}> = [
  { id: 'TUNAI', icon: Banknote, labelKey: 'tunai' },
  { id: 'TRANSFER', icon: Landmark, labelKey: 'transfer' },
  { id: 'DEBIT', icon: CreditCard, labelKey: 'debit' },
];

export function TerimaPembayaranDialog({
  open,
  onOpenChange,
  transaksiId,
  nomorOrder,
  grandTotal,
  onLunas,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaksiId: string;
  nomorOrder: string;
  grandTotal: number;
  /** Dipanggil setelah lunas, membawa teks struk yang sudah dirender server. */
  onLunas?: (struk: string) => void;
}) {
  const t = useTranslations('dashboard.kasir.bayar');
  const tMetode = useTranslations('dashboard.kasir.payment');

  const [paymentMethod, setPaymentMethod] =
    useState<KasirPaymentMethod>('TUNAI');
  const [uangDiterima, setUangDiterima] = useState('');

  const { mutate: bayar, isPending } = useBayarTransaksi();

  const uangAngka = Number(uangDiterima.replace(/\D/g, '')) || 0;
  const kurang = paymentMethod === 'TUNAI' ? grandTotal - uangAngka : 0;
  const kembalian = paymentMethod === 'TUNAI' ? Math.max(0, -kurang) : 0;
  const bisaLunas =
    !isPending &&
    (paymentMethod !== 'TUNAI' || (uangDiterima !== '' && kurang <= 0));

  const handleBayar = () => {
    if (!bisaLunas) return;

    bayar(
      {
        id: transaksiId,
        data: {
          paymentMethod,
          ...(paymentMethod === 'TUNAI' ? { uangDiterima: uangAngka } : {}),
        },
      },
      {
        onSuccess: (hasil) => {
          onOpenChange(false);
          setUangDiterima('');
          onLunas?.(hasil.struk);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {nomorOrder} · {formatPriceIDR(grandTotal)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metode */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tMetode('label')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {METODE.map((m) => {
                const aktif = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    aria-pressed={aktif}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-sm font-medium transition-colors',
                      aktif
                        ? 'border-primary bg-primary/[0.06] text-primary'
                        : 'text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    <m.icon className="h-4 w-4" aria-hidden />
                    {tMetode(m.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Uang tunai — hanya untuk TUNAI, sama seperti di keranjang */}
          {paymentMethod === 'TUNAI' && (
            <div>
              <label
                htmlFor="bayar-uang"
                className="text-xs font-medium text-muted-foreground"
              >
                {t('cashReceived')}
              </label>
              <Input
                id="bayar-uang"
                inputMode="numeric"
                value={
                  uangDiterima ? Number(uangDiterima).toLocaleString('id-ID') : ''
                }
                onChange={(e) =>
                  setUangDiterima(e.target.value.replace(/\D/g, ''))
                }
                placeholder="0"
                className="mt-1 h-11 text-lg font-semibold tabular-nums"
              />

              <div className="mt-2 flex flex-wrap gap-1.5">
                {NOMINAL_CEPAT.map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    onClick={() => setUangDiterima(String(nominal))}
                    className="rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors hover:bg-muted"
                  >
                    {nominal / 1000}rb
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setUangDiterima(String(grandTotal))}
                  className="rounded-lg border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  {t('exactAmount')}
                </button>
              </div>

              {uangDiterima !== '' && (
                <p
                  className={cn(
                    'mt-2 text-sm font-medium tabular-nums',
                    kurang > 0
                      ? 'text-destructive'
                      : 'text-emerald-600 dark:text-emerald-400',
                  )}
                  aria-live="polite"
                >
                  {kurang > 0
                    ? t('shortBy', { nominal: formatPriceIDR(kurang) })
                    : t('change', { nominal: formatPriceIDR(kembalian) })}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleBayar}
            disabled={!bisaLunas}
            className="h-11 w-full text-base font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                {t('saving')}
              </>
            ) : (
              t('confirm', { nominal: formatPriceIDR(grandTotal) })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
