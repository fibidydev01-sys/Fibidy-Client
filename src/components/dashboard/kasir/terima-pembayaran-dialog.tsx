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
//
// [UI/UX — Agu 2026] "Sama dengan keranjang" kini benar sampai ke komponennya,
// bukan cuma mirip secara visual: RadioGroup untuk metode, InputGroup dengan
// awalan "Rp" untuk nominal, dan Field untuk pesan kurang/kembalian. Sebelum
// ini kedua layar menulis markup-nya sendiri-sendiri dan sudah mulai
// berselisih (tinggi tombol metode berbeda 4px).
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Banknote, CreditCard, Landmark } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
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
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as KasirPaymentMethod)}
            aria-label={tMetode('label')}
            className="grid-cols-3 gap-2"
          >
            {METODE.map((m) => (
              <FieldLabel key={m.id} htmlFor={`bayar-metode-${m.id}`}>
                <Card className="w-full items-center gap-1.5 py-3 text-center transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                  <CardContent className="flex flex-col items-center gap-1.5 px-2">
                    <m.icon className="size-4" aria-hidden />
                    <span className="text-sm font-medium">
                      {tMetode(m.labelKey)}
                    </span>
                    <RadioGroupItem
                      value={m.id}
                      id={`bayar-metode-${m.id}`}
                      className="sr-only"
                    />
                  </CardContent>
                </Card>
              </FieldLabel>
            ))}
          </RadioGroup>

          {/* Uang tunai — hanya untuk TUNAI, sama seperti di keranjang */}
          {paymentMethod === 'TUNAI' && (
            <div className="space-y-3">
              <Field>
                <FieldLabel htmlFor="bayar-uang">
                  {t('cashReceived')}
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>Rp</InputGroupAddon>
                  <InputGroupInput
                    id="bayar-uang"
                    inputMode="numeric"
                    value={
                      uangDiterima
                        ? Number(uangDiterima).toLocaleString('id-ID')
                        : ''
                    }
                    onChange={(e) =>
                      setUangDiterima(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="0"
                    className="text-lg font-semibold tabular-nums"
                  />
                </InputGroup>

                {uangDiterima !== '' &&
                  (kurang > 0 ? (
                    <FieldError className="tabular-nums">
                      {t('shortBy', { nominal: formatPriceIDR(kurang) })}
                    </FieldError>
                  ) : (
                    <FieldDescription
                      className="font-medium tabular-nums text-emerald-600 dark:text-emerald-400"
                      aria-live="polite"
                    >
                      {t('change', { nominal: formatPriceIDR(kembalian) })}
                    </FieldDescription>
                  ))}
              </Field>

              <div className="flex flex-wrap gap-1.5">
                {NOMINAL_CEPAT.map((nominal) => (
                  <Button
                    key={nominal}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="tabular-nums"
                    onClick={() => setUangDiterima(String(nominal))}
                  >
                    {nominal / 1000}rb
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setUangDiterima(String(grandTotal))}
                >
                  {t('exactAmount')}
                </Button>
              </div>
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
                <Spinner className="mr-2 size-4" />
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
