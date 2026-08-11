'use client';

// ============================================================================
// KERANJANG (CHECKOUT)
// File: src/app/[locale]/(dashboard)/dashboard/kasir/keranjang/client.tsx
//
// Halaman penuh, bukan drawer: checkout adalah ALUR, bukan gangguan sesaat.
// Ia butuh ruang sendiri dan tombol kembali yang jelas — dan tombol kembali
// itu meninggalkan isi keranjang tetap utuh (state ada di store, bukan di
// halaman ini).
//
// Tiga zona wajib:
//   1. Sticky sub-header — input uang tunai + nominal cepat (hanya TUNAI)
//   2. Body scrollable   — item + stepper, baris gratis promo, diskon, metode
//   3. Sticky footer     — rincian angka + satu tombol bayar besar
//
// Angka di layar ini adalah PRATINJAU. Yang tersimpan dihitung ulang server:
// harga diambil dari database, baris gratis dihitung engine promo di sana.
// Kalau keduanya berbeda, yang benar adalah server.
// ============================================================================

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Banknote,
  ChevronRight,
  Clock,
  CreditCard,
  Gift,
  Loader2,
  Landmark,
  ShoppingCart,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { getErrorMessage } from '@/lib/api/client';
import { hitungBarisGratis } from '@/lib/shared/kasir-promo';
import {
  hitungTotal,
  hitungTotalItem,
  useKasirCartStore,
} from '@/stores/kasir-cart-store';
import {
  useCreateTransaksi,
  usePromoRulesAktif,
} from '@/hooks/dashboard/use-kasir';
import { QtyStepper } from '@/components/dashboard/kasir/qty-stepper';
import { DiskonPicker } from '@/components/dashboard/kasir/diskon-picker';
import { StrukDialog } from '@/components/dashboard/kasir/struk-dialog';
import {
  GratisBadge,
  KasirBadge,
} from '@/components/dashboard/kasir/kasir-badges';
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

export function KeranjangClient() {
  const t = useTranslations('dashboard.kasir.cart');
  const tMetode = useTranslations('dashboard.kasir.payment');
  const router = useRouter();

  const lines = useKasirCartStore((s) => s.lines);
  const diskon = useKasirCartStore((s) => s.diskon);
  const paymentMethod = useKasirCartStore((s) => s.paymentMethod);
  const uangDiterima = useKasirCartStore((s) => s.uangDiterima);
  const picNama = useKasirCartStore((s) => s.picNama);
  const setPicNama = useKasirCartStore((s) => s.setPicNama);
  const increment = useKasirCartStore((s) => s.increment);
  const decrement = useKasirCartStore((s) => s.decrement);
  const clear = useKasirCartStore((s) => s.clear);
  const setDiskon = useKasirCartStore((s) => s.setDiskon);
  const setPaymentMethod = useKasirCartStore((s) => s.setPaymentMethod);
  const setUangDiterima = useKasirCartStore((s) => s.setUangDiterima);

  const { data: promoAktif } = usePromoRulesAktif();
  const { mutate: buatTransaksi, isPending } = useCreateTransaksi();

  // [JASA] Pesanan yang mengandung layanan boleh dicatat dulu, dibayar saat
  // pelanggan mengambil. Pesanan barang murni tidak — itu piutang, dan
  // piutang bukan fitur yang dibangun di sini (server menolaknya juga).
  const adaJasa = lines.some((l) => l.kind === 'JASA');

  const [mode, setMode] = useState<'cart' | 'diskon'>('cart');
  const [konfirmasiKosong, setKonfirmasiKosong] = useState(false);
  const [gagal, setGagal] = useState<string | null>(null);
  const [struk, setStruk] = useState<{ teks: string; nomorOrder: string } | null>(
    null,
  );

  const { subtotal, diskonNominal, grandTotal } = hitungTotal(
    lines,
    diskon?.persen ?? 0,
  );
  const totalItem = hitungTotalItem(lines);

  const barisGratis = useMemo(
    () => hitungBarisGratis(lines, promoAktif ?? []),
    [lines, promoAktif],
  );

  const uangAngka = Number(uangDiterima.replace(/\D/g, '')) || 0;
  const kurang = paymentMethod === 'TUNAI' ? grandTotal - uangAngka : 0;
  const kembalian = paymentMethod === 'TUNAI' ? Math.max(0, -kurang) : 0;
  const bisaBayar =
    lines.length > 0 &&
    !isPending &&
    (paymentMethod !== 'TUNAI' || (uangDiterima !== '' && kurang <= 0));

  // ── Bayar / catat pesanan ─────────────────────────────────────────────
  const kirimTransaksi = (bayarNanti: boolean) => {
    buatTransaksi(
      {
        items: lines.map((l) => ({
          productId: l.productId,
          qty: l.qty,
          namaProduk: l.namaProduk,
          hargaSatuan: l.hargaSatuan,
        })),
        diskonPresetId: diskon?.id,
        diskonPersen: diskon?.persen ?? 0,
        ...(adaJasa && picNama.trim() ? { picNama: picNama.trim() } : {}),
        ...(bayarNanti
          ? { bayarNanti: true }
          : {
              paymentMethod,
              ...(paymentMethod === 'TUNAI' ? { uangDiterima: uangAngka } : {}),
            }),
      },
      {
        onSuccess: (hasil) => {
          // Struk muncul otomatis — bukan hasil navigasi manual.
          setStruk({ teks: hasil.struk, nomorOrder: hasil.nomorOrder });
        },
        // Aksi gagal pakai dialog yang harus ditutup manual, bukan toast:
        // kasir harus benar-benar membaca alasannya sebelum mencoba lagi.
        onError: (err) => setGagal(getErrorMessage(err)),
      },
    );
  };

  const handleBayar = () => {
    if (!bisaBayar) return;
    kirimTransaksi(false);
  };

  const handleBayarNanti = () => {
    if (lines.length === 0 || isPending) return;
    kirimTransaksi(true);
  };

  const handleSelesai = () => {
    clear();
    setStruk(null);
    router.push('/dashboard/kasir');
  };

  // ── Keranjang kosong ──────────────────────────────────────────────────
  if (lines.length === 0 && !struk) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/kasir')}
            aria-label={t('back')}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Button>
          <h1 className="text-lg font-semibold">{t('title')}</h1>
        </div>

        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShoppingCart />
            </EmptyMedia>
            <EmptyTitle>{t('emptyTitle')}</EmptyTitle>
            <EmptyDescription>{t('emptyDescription')}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => router.push('/dashboard/kasir')}>
              {t('emptyCta')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // ── Mode picker diskon (tukar isi, bukan modal) ───────────────────────
  if (mode === 'diskon') {
    return (
      <div className="mx-auto max-w-2xl">
        <DiskonPicker
          subtotal={subtotal}
          terpilihId={diskon?.id ?? null}
          onPilih={(preset) => {
            setDiskon(
              preset
                ? { id: preset.id, nama: preset.nama, persen: preset.persen }
                : null,
            );
            setMode('cart');
          }}
          onBack={() => setMode('cart')}
        />
      </div>
    );
  }

  // ── Keranjang ─────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/dashboard/kasir')}
          aria-label={t('back')}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold leading-tight">{t('title')}</h1>
          <p className="text-xs text-muted-foreground">
            {t('itemCount', { jumlah: totalItem })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setKonfirmasiKosong(true)}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {t('clear')}
        </Button>
      </div>

      {/* ZONA 1 — sticky sub-header uang tunai (hanya TUNAI) */}
      {paymentMethod === 'TUNAI' && (
        <div className="sticky top-0 z-20 -mx-1 mt-3 bg-background/95 px-1 py-3 backdrop-blur">
          <div className="rounded-xl border bg-card p-3">
            <label
              htmlFor="uang-diterima"
              className="text-xs font-medium text-muted-foreground"
            >
              {t('cashReceived')}
            </label>
            <Input
              id="uang-diterima"
              inputMode="numeric"
              value={uangDiterima ? Number(uangDiterima).toLocaleString('id-ID') : ''}
              onChange={(e) => setUangDiterima(e.target.value.replace(/\D/g, ''))}
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

            {/* Peringatan kurang / kembalian — real-time, sebelum bayar. */}
            {uangDiterima !== '' && (
              <p
                className={cn(
                  'mt-2 text-sm font-medium tabular-nums',
                  kurang > 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-400',
                )}
                aria-live="polite"
              >
                {kurang > 0
                  ? t('shortBy', { nominal: formatPriceIDR(kurang) })
                  : t('change', { nominal: formatPriceIDR(kembalian) })}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ZONA 2 — body */}
      <div className="mt-3 flex-1 space-y-4 pb-4">
        {/* Item */}
        <div className="space-y-2">
          {lines.map((line) => {
            const gratis = barisGratis.find((g) => g.productId === line.productId);

            return (
              <div key={line.productId} className="rounded-xl border">
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate font-medium">{line.namaProduk}</p>
                      {line.kind === 'JASA' && (
                        <KasirBadge tone="muted">
                          <Wrench className="h-2.5 w-2.5" aria-hidden />
                          {line.durasiLabel || t('layananLabel')}
                        </KasirBadge>
                      )}
                    </div>
                    <p className="text-sm tabular-nums text-muted-foreground">
                      {formatPriceIDR(line.hargaSatuan)} × {line.qty} ={' '}
                      <span className="font-medium text-foreground">
                        {formatPriceIDR(line.hargaSatuan * line.qty)}
                      </span>
                    </p>
                  </div>
                  <QtyStepper
                    qty={line.qty}
                    onIncrement={() => increment(line.productId)}
                    onDecrement={() => decrement(line.productId)}
                  />
                </div>

                {/* Baris gratis promo — menempel di item pemicunya supaya
                    hubungannya terbaca, bukan berdiri sendiri di bawah. */}
                {gratis && (
                  <div className="flex items-center gap-2 border-t bg-blue-50/50 px-3 py-2 dark:bg-blue-950/20">
                    <Gift
                      className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400"
                      aria-hidden
                    />
                    <span className="flex-1 text-sm text-muted-foreground">
                      {gratis.namaProduk} × {gratis.qty}
                    </span>
                    <GratisBadge />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* [JASA] Petugas pengerjaan — satu isian untuk seluruh pesanan.
            Muncul hanya kalau ada layanan; untuk pesanan barang murni field
            ini tidak punya arti. */}
        {adaJasa && (
          <div className="rounded-xl border px-3 py-3">
            <label
              htmlFor="pic-nama"
              className="flex items-center gap-1.5 text-sm font-medium"
            >
              <UserRound className="h-3.5 w-3.5" aria-hidden />
              {t('picLabel')}
            </label>
            <Input
              id="pic-nama"
              value={picNama}
              maxLength={60}
              onChange={(e) => setPicNama(e.target.value)}
              placeholder={t('picPlaceholder')}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('picHelper')}
            </p>
          </div>
        )}

        {/* Diskon */}
        <button
          type="button"
          onClick={() => setMode('diskon')}
          className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors hover:bg-muted/50"
        >
          <span className="flex-1">
            <span className="block text-sm font-medium">{t('discount')}</span>
            <span className="block text-sm text-muted-foreground">
              {diskon
                ? `${diskon.nama} · ${diskon.persen}%`
                : t('discountNone')}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
        </button>

        {/* Metode pembayaran */}
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
                  <m.icon className="h-4.5 w-4.5" aria-hidden />
                  {tMetode(m.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ZONA 3 — sticky footer */}
      <div className="sticky bottom-16 z-20 -mx-1 border-t bg-background/95 px-1 py-3 backdrop-blur md:bottom-0">
        <dl className="mb-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t('subtotal')}</dt>
            <dd className="tabular-nums">{formatPriceIDR(subtotal)}</dd>
          </div>
          {diskonNominal > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                {t('discountLine', { persen: diskon?.persen ?? 0 })}
              </dt>
              <dd className="tabular-nums text-emerald-600 dark:text-emerald-400">
                −{formatPriceIDR(diskonNominal)}
              </dd>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 text-base font-bold">
            <dt>{t('total')}</dt>
            <dd className="tabular-nums">{formatPriceIDR(grandTotal)}</dd>
          </div>
        </dl>

        <Button
          onClick={handleBayar}
          disabled={!bisaBayar}
          size="lg"
          className="h-12 w-full text-base font-semibold"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              {t('paying')}
            </>
          ) : (
            t('pay', { nominal: formatPriceIDR(grandTotal) })
          )}
        </Button>

        {/* [JASA] Jalur kedua: catat sekarang, bayar saat diambil. Ditaruh
            di bawah tombol utama dan dengan gaya sekunder — mayoritas
            transaksi tetap dibayar saat itu juga, dan tombol yang sama
            menonjolnya akan memperlambat kasus yang paling sering. */}
        {adaJasa && (
          <Button
            onClick={handleBayarNanti}
            disabled={lines.length === 0 || isPending}
            variant="outline"
            className="mt-2 h-11 w-full gap-2"
          >
            <Clock className="h-4 w-4" aria-hidden />
            {t('payLater')}
          </Button>
        )}
      </div>

      {/* Konfirmasi kosongkan — aksi tidak bisa dibatalkan */}
      <AlertDialog open={konfirmasiKosong} onOpenChange={setKonfirmasiKosong}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clearConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clearConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('clearCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clear();
                setKonfirmasiKosong(false);
                router.push('/dashboard/kasir');
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t('clearConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Kegagalan bayar — dialog, bukan toast */}
      <AlertDialog open={!!gagal} onOpenChange={(open) => !open && setGagal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('payFailedTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{gagal}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setGagal(null)}>
              {t('payFailedClose')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Struk — muncul otomatis setelah bayar berhasil */}
      {struk && (
        <StrukDialog
          open
          onOpenChange={(open) => {
            if (!open) handleSelesai();
          }}
          teks={struk.teks}
          nomorOrder={struk.nomorOrder}
          onSelesai={handleSelesai}
        />
      )}
    </div>
  );
}
