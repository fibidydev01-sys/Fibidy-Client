'use client';

// ============================================================================
// KELOLA STOK — restock & opname
// File: src/components/dashboard/kasir/stok-kelola-sheet.tsx
//
// Dua aksi berbeda sifat, jadi dua tab berbeda — bukan satu input "ubah stok":
//   RESTOCK → barang MASUK. Yang diisi jumlah tambahan. Tercatat 'IN'.
//   OPNAME  → hasil HITUNG FISIK. Yang diisi angka sebenarnya di rak, bukan
//             selisihnya. Tercatat 'OPNAME'.
// Menyatukan keduanya jadi satu kolom angka adalah sumber salah input paling
// umum di aplikasi stok: "isi 10" bisa berarti tambah 10 atau jadi 10.
//
// Setiap input menampilkan dampaknya secara real-time sebelum disimpan
// ("Stok jadi 25"), bukan setelah.
//
// Opname dengan selisih besar dikonfirmasi DULU lewat tabel perbandingan.
// Ambangnya disamakan dengan server (>50% stok sistem DAN >=10 unit) supaya
// yang dikonfirmasi di layar sama persis dengan yang dianggap server janggal.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2, PackagePlus, ClipboardCheck } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { getErrorMessage } from '@/lib/api/client';
import { useOpname, useRestock } from '@/hooks/dashboard/use-kasir';
import type { StokProdukRingkas } from '@/types/kasir';

const OPNAME_SELISIH_MINIMAL = 10;
const OPNAME_SELISIH_RASIO = 0.5;

/** Sama persis dengan aturan di KasirStokService.opname() pada server. */
export function selisihBesar(stokSistem: number, stokFisik: number): boolean {
  const selisih = Math.abs(stokFisik - stokSistem);
  return (
    selisih >= OPNAME_SELISIH_MINIMAL &&
    stokSistem > 0 &&
    selisih > stokSistem * OPNAME_SELISIH_RASIO
  );
}

export function StokKelolaSheet({
  produk,
  onClose,
}: {
  produk: StokProdukRingkas | null;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard.kasir.stok');

  const { mutate: restock, isPending: restockPending } = useRestock();
  const { mutate: opname, isPending: opnamePending } = useOpname();

  const [jumlahRestock, setJumlahRestock] = useState('');
  const [stokFisik, setStokFisik] = useState('');
  const [konfirmasiOpname, setKonfirmasiOpname] = useState(false);

  const tutup = () => {
    setJumlahRestock('');
    setStokFisik('');
    setKonfirmasiOpname(false);
    onClose();
  };

  if (!produk) {
    return (
      <Sheet open={false} onOpenChange={() => undefined}>
        <SheetContent />
      </Sheet>
    );
  }

  const angkaRestock = Number(jumlahRestock.replace(/\D/g, '')) || 0;
  const angkaFisik = stokFisik === '' ? null : Number(stokFisik.replace(/\D/g, ''));
  const selisih = angkaFisik === null ? 0 : angkaFisik - produk.stok;
  const perluKonfirmasi =
    angkaFisik !== null && selisihBesar(produk.stok, angkaFisik);

  const onError = (err: unknown) => toast.error(getErrorMessage(err));

  const submitRestock = () => {
    if (angkaRestock < 1) return;
    restock(
      { productId: produk.id, jumlah: angkaRestock },
      { onSuccess: tutup, onError },
    );
  };

  const submitOpname = () => {
    if (angkaFisik === null) return;
    opname(
      { productId: produk.id, stokFisik: angkaFisik },
      {
        onSuccess: (hasil) => {
          toast.success(
            t('opnameDone', {
              selisih: hasil.selisih > 0 ? `+${hasil.selisih}` : `${hasil.selisih}`,
            }),
          );
          tutup();
        },
        onError,
      },
    );
  };

  return (
    <>
      <Sheet open onOpenChange={(open) => !open && tutup()}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="truncate">{produk.name}</SheetTitle>
            <SheetDescription>
              {t('currentStock', { stok: produk.stok })} ·{' '}
              {t('stockValue', {
                nilai: formatPriceIDR(produk.price * produk.stok),
              })}
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-6">
            <Tabs defaultValue="restock">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="restock" className="gap-1.5">
                  <PackagePlus className="h-3.5 w-3.5" aria-hidden />
                  {t('restockTab')}
                </TabsTrigger>
                <TabsTrigger value="opname" className="gap-1.5">
                  <ClipboardCheck className="h-3.5 w-3.5" aria-hidden />
                  {t('opnameTab')}
                </TabsTrigger>
              </TabsList>

              {/* ── Restock ─────────────────────────────────────── */}
              <TabsContent value="restock" className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('restockHelp')}
                </p>

                <div className="space-y-1.5">
                  <label htmlFor="jumlah-restock" className="text-sm font-medium">
                    {t('restockLabel')}
                  </label>
                  <Input
                    id="jumlah-restock"
                    inputMode="numeric"
                    value={jumlahRestock}
                    onChange={(e) =>
                      setJumlahRestock(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="0"
                    className="h-11 text-lg font-semibold tabular-nums"
                  />
                  {angkaRestock > 0 && (
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      {t('restockPreview', {
                        sebelum: produk.stok,
                        sesudah: produk.stok + angkaRestock,
                      })}
                    </p>
                  )}
                </div>

                <Button
                  onClick={submitRestock}
                  disabled={angkaRestock < 1 || restockPending}
                  className="w-full"
                >
                  {restockPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  )}
                  {restockPending ? t('saving') : t('restockSubmit')}
                </Button>
              </TabsContent>

              {/* ── Opname ──────────────────────────────────────── */}
              <TabsContent value="opname" className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">{t('opnameHelp')}</p>

                <div className="space-y-1.5">
                  <label htmlFor="stok-fisik" className="text-sm font-medium">
                    {t('opnameLabel')}
                  </label>
                  <Input
                    id="stok-fisik"
                    inputMode="numeric"
                    value={stokFisik}
                    onChange={(e) => setStokFisik(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="h-11 text-lg font-semibold tabular-nums"
                  />
                  {angkaFisik !== null && (
                    <p
                      className={cn(
                        'text-sm',
                        selisih === 0
                          ? 'text-muted-foreground'
                          : selisih > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                      )}
                      aria-live="polite"
                    >
                      {selisih === 0
                        ? t('opnameNoDiff')
                        : t('opnamePreview', {
                            selisih: selisih > 0 ? `+${selisih}` : `${selisih}`,
                          })}
                    </p>
                  )}
                </div>

                <Button
                  onClick={() =>
                    perluKonfirmasi ? setKonfirmasiOpname(true) : submitOpname()
                  }
                  disabled={angkaFisik === null || opnamePending}
                  className="w-full"
                >
                  {opnamePending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  )}
                  {opnamePending ? t('saving') : t('opnameSubmit')}
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Konfirmasi selisih besar — tabel perbandingan, bukan sekadar
          "Anda yakin?". Kasir perlu melihat angkanya berdampingan untuk
          menyadari salah ketik sebelum stok terlanjur berubah. */}
      <AlertDialog open={konfirmasiOpname} onOpenChange={setKonfirmasiOpname}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('bigDiffTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('bigDiffDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <dl className="divide-y rounded-lg border text-sm">
            <div className="flex justify-between px-3 py-2">
              <dt className="text-muted-foreground">{t('bigDiffSystem')}</dt>
              <dd className="font-medium tabular-nums">{produk.stok}</dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-muted-foreground">{t('bigDiffPhysical')}</dt>
              <dd className="font-medium tabular-nums">{angkaFisik}</dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-muted-foreground">{t('bigDiffDelta')}</dt>
              <dd
                className={cn(
                  'font-bold tabular-nums',
                  selisih > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-destructive',
                )}
              >
                {selisih > 0 ? `+${selisih}` : selisih}
              </dd>
            </div>
          </dl>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={opnamePending}>
              {t('bigDiffRecheck')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                submitOpname();
              }}
              disabled={opnamePending}
            >
              {opnamePending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {t('bigDiffConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
