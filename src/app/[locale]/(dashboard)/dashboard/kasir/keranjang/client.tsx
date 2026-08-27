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
// Angka di layar ini adalah PRATINJAU. Yang tersimpan dihitung ulang server:
// harga diambil dari database, baris gratis dihitung engine promo di sana.
// Kalau keduanya berbeda, yang benar adalah server.
//
// [UI/UX — Agu 2026]
//   • Lebar penuh, konsisten dengan semua tab kasir lainnya.
//   • Di ≥lg isinya dua kolom: item di kiri, pembayaran di kanan yang menempel
//     (sticky). Kasir tidak perlu menggulir bolak-balik antara daftar item dan
//     kolom uang. Di bawah lg susunannya tetap satu kolom dengan ringkasan
//     menempel di bawah — persis alur yang sudah dikenal.
//   • Metode pembayaran jadi RadioGroup (memang satu-dari-tiga), field PIC
//     jadi Field, tiap zona jadi Card dengan Header/Content/Footer, dan input
//     uang jadi InputGroup dengan awalan "Rp".
//   • Sub-nav dimatikan: dari keranjang cuma ada dua arah — selesai, atau
//     kembali. Breadcrumb menunjukkan posisi itu tanpa menawarkan pintu ketiga.
// ============================================================================

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Banknote,
  ChevronRight,
  Clock,
  CreditCard,
  Gift,
  Landmark,
  ShoppingCart,
  Trash2,
  UserRound,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
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
import { formatPriceIDR } from '@/lib/shared/format';
import { MahkotaKecil } from '@/components/dashboard/shared/notice-mahkota';
import { useKasirLock } from '@/hooks/dashboard/use-kasir-lock';
import { getErrorMessage } from '@/lib/api/client';
import { Link, useRouter } from '@/i18n/navigation';
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
import { KasirPageShell } from '@/components/dashboard/kasir/kasir-page-shell';
import { KasirEmptyState } from '@/components/dashboard/kasir/kasir-state';
import {
  KasirRowButton,
  KasirRowCard,
} from '@/components/dashboard/kasir/kasir-row-card';
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

  // Mahkota di tombol bayar. Keranjangnya tetap bisa diisi dan dihitung —
  // yang ditahan cuma mencatat transaksinya.
  const { terkunci, jaga } = useKasirLock();

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

  const tombolKembali = (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => router.push('/dashboard/kasir')}
      aria-label={t('back')}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden />
    </Button>
  );

  const jejak = (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/kasir">{t('breadcrumbKasir')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t('breadcrumbCart')}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  // ── Keranjang kosong ──────────────────────────────────────────────────
  if (lines.length === 0 && !struk) {
    return (
      <KasirPageShell
        title={t('title')}
        showTabs={false}
        leading={tombolKembali}
      >
        <KasirEmptyState
          icon={<ShoppingCart />}
          title={t('emptyTitle')}
          description={t('emptyDescription')}
        >
          <Button onClick={() => router.push('/dashboard/kasir')}>
            {t('emptyCta')}
          </Button>
        </KasirEmptyState>
      </KasirPageShell>
    );
  }

  // ── Mode picker diskon (tukar isi, bukan modal) ───────────────────────
  if (mode === 'diskon') {
    return (
      <KasirPageShell
        title={t('title')}
        showTabs={false}
        leading={tombolKembali}
      >
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
      </KasirPageShell>
    );
  }

  // ── Ringkasan angka + tombol bayar ────────────────────────────────────
  //
  // Didefinisikan sekali, dipasang di dua tempat: kolom kanan di desktop dan
  // bar menempel di bawah pada ponsel. Hanya satu yang terlihat pada satu
  // waktu — menyalin markupnya dua kali adalah cara tercepat membuat dua
  // total yang berbeda di layar yang sama.
  const rincianAngka = (
    <dl className="space-y-1 text-sm">
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
      <Separator className="my-2" />
      <div className="flex justify-between text-base font-bold">
        <dt>{t('total')}</dt>
        <dd className="tabular-nums">{formatPriceIDR(grandTotal)}</dd>
      </div>
    </dl>
  );

  const tombolBayar = (
    <div className="flex w-full flex-col gap-2">
      {/* Tombol bayar TIDAK dimatikan untuk tenant FREE — ia tetap terlihat
          dan tetap bisa ditekan, cuma dapat mahkota. Menekannya membuka modal
          upgrade, bukan diam saja. Tombol mati tidak menjelaskan apa pun.
          Yang menahan transaksinya ada di `useKasirMutation` (permintaannya
          tidak pernah berangkat) dan di KasirPlanGuard server. */}
      <Button
        onClick={jaga(handleBayar)}
        disabled={!bisaBayar}
        size="lg"
        className="h-12 w-full gap-2 text-base font-semibold"
      >
        {isPending ? (
          <>
            <Spinner className="mr-2 size-4" />
            {t('paying')}
          </>
        ) : (
          <>
            {terkunci && <MahkotaKecil className="text-amber-300" />}
            {t('pay', { nominal: formatPriceIDR(grandTotal) })}
          </>
        )}
      </Button>

      {/* [JASA] Jalur kedua: catat sekarang, bayar saat diambil. Ditaruh
          di bawah tombol utama dan dengan gaya sekunder — mayoritas
          transaksi tetap dibayar saat itu juga, dan tombol yang sama
          menonjolnya akan memperlambat kasus yang paling sering. */}
      {adaJasa && (
        <Button
          onClick={jaga(handleBayarNanti)}
          disabled={lines.length === 0 || isPending}
          variant="outline"
          className="h-11 w-full gap-2"
        >
          {terkunci ? (
            <MahkotaKecil />
          ) : (
            <Clock className="h-4 w-4" aria-hidden />
          )}
          {t('payLater')}
        </Button>
      )}
    </div>
  );

  // ── Keranjang ─────────────────────────────────────────────────────────
  return (
    <KasirPageShell
      title={t('title')}
      subtitle={t('itemCount', { jumlah: totalItem })}
      showTabs={false}
      leading={tombolKembali}
      toolbar={jejak}
      actions={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setKonfirmasiKosong(true)}
          className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {t('clear')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[1fr_360px] lg:items-start lg:gap-6">
        {/* ZONA 1 — uang tunai (hanya TUNAI).
            Ditulis PERTAMA di DOM dengan sengaja. Di ponsel kolom ini harus
            berada DI ATAS daftar item dan menempel saat digulir — kasir
            mengetik nominal sambil melihat item, dan itu perilaku yang sudah
            ada sebelum layar ini dibagi dua kolom. Di ≥lg penempatan grid
            eksplisit memindahkannya ke baris kedua kolom kanan. */}
        {paymentMethod === 'TUNAI' && (
          <Card className="sticky top-0 z-20 py-4 lg:static lg:col-start-2 lg:row-start-2">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">{t('cashTitle')}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 px-4">
              <Field>
                <FieldLabel htmlFor="uang-diterima">
                  {t('cashReceived')}
                </FieldLabel>
                <InputGroup>
                  <InputGroupAddon>Rp</InputGroupAddon>
                  <InputGroupInput
                    id="uang-diterima"
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

                {/* Peringatan kurang / kembalian — real-time, sebelum bayar. */}
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
            </CardContent>
          </Card>
        )}

        {/* ZONA 2 — isi pesanan. */}
        <div className="space-y-4 lg:col-start-1 lg:row-start-1 lg:row-span-4">
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">{t('itemsTitle')}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 px-4">
              {lines.map((line) => {
                const gratis = barisGratis.find(
                  (g) => g.productId === line.productId,
                );

                return (
                  <KasirRowCard key={line.productId}>
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="truncate font-medium">
                            {line.namaProduk}
                          </p>
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
                      <>
                        <Separator />
                        <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 dark:bg-blue-950/20">
                          <Gift
                            className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400"
                            aria-hidden
                          />
                          <span className="flex-1 text-sm text-muted-foreground">
                            {gratis.namaProduk} × {gratis.qty}
                          </span>
                          <GratisBadge />
                        </div>
                      </>
                    )}
                  </KasirRowCard>
                );
              })}
            </CardContent>
          </Card>

          {/* [JASA] Petugas pengerjaan — satu isian untuk seluruh pesanan.
              Muncul hanya kalau ada layanan; untuk pesanan barang murni field
              ini tidak punya arti. */}
          {adaJasa && (
            <Card className="py-4">
              <CardContent className="px-4">
                <Field>
                  <FieldLabel htmlFor="pic-nama">
                    <UserRound className="h-3.5 w-3.5" aria-hidden />
                    {t('picLabel')}
                  </FieldLabel>
                  <Input
                    id="pic-nama"
                    value={picNama}
                    maxLength={60}
                    onChange={(e) => setPicNama(e.target.value)}
                    placeholder={t('picPlaceholder')}
                  />
                  <FieldDescription>{t('picHelper')}</FieldDescription>
                </Field>
              </CardContent>
            </Card>
          )}

          {/* Diskon */}
          <KasirRowCard>
            <KasirRowButton onClick={() => setMode('diskon')}>
              <span className="flex-1">
                <span className="block text-sm font-medium">
                  {t('discount')}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {diskon
                    ? `${diskon.nama} · ${diskon.persen}%`
                    : t('discountNone')}
                </span>
              </span>
              <ChevronRight
                className="h-4 w-4 text-muted-foreground"
                aria-hidden
              />
            </KasirRowButton>
          </KasirRowCard>
        </div>

        {/* ZONA 3 — metode pembayaran. Di ponsel ia jatuh setelah diskon,
            urutan yang sama dengan sebelum layar dibagi dua kolom. */}
        <Card className="py-4 lg:col-start-2 lg:row-start-1">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">{t('methodTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) =>
                setPaymentMethod(v as KasirPaymentMethod)
              }
              aria-label={tMetode('label')}
              className="grid grid-cols-3 gap-2"
            >
              {METODE.map((m) => (
                <label key={m.id} htmlFor={`metode-${m.id}`} className="cursor-pointer">
                  <span className="flex h-11 w-full items-center justify-center gap-2 rounded-[var(--shape-control)] border bg-card px-3 text-sm font-medium transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5">
                    <m.icon className="size-4 shrink-0" aria-hidden />
                    {tMetode(m.labelKey)}
                    <RadioGroupItem
                      value={m.id}
                      id={`metode-${m.id}`}
                      className="sr-only"
                    />
                  </span>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Ringkasan versi desktop — menempel di kolom kanan. Versi
            ponselnya adalah bar di bawah, di luar grid ini. */}
        <Card className="hidden py-4 lg:col-start-2 lg:row-start-3 lg:block lg:sticky lg:top-6">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">{t('summaryTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="px-4">{rincianAngka}</CardContent>
          <CardFooter className="px-4">{tombolBayar}</CardFooter>
        </Card>
      </div>

      {/* Ringkasan menempel di bawah — hanya di bawah lg, tempat kolom kanan
          tidak ada. Offsetnya memakai --kasir-bottom-inset, bukan angka yang
          ditebak dari tinggi MobileNavbar. */}
      <Card className="sticky bottom-[calc(var(--kasir-bottom-inset)+0.5rem)] z-20 gap-3 bg-background/95 py-3 shadow-lg backdrop-blur lg:hidden">
        <CardContent className="px-3">{rincianAngka}</CardContent>
        <CardFooter className="px-3">{tombolBayar}</CardFooter>
      </Card>

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
    </KasirPageShell>
  );
}