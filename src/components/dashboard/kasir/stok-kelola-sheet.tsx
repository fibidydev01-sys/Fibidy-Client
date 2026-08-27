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
//
// [UI/UX — Agu 2026]
//   • Panel ini paling sering dibuka dari ponsel sambil berdiri di depan rak,
//     jadi di bawah md ia jadi Drawer (masuk dari bawah, bisa ditarik turun)
//     lewat ResponsiveSheet. Di desktop tetap Sheet dari kanan.
//   • Tombol simpan pindah ke footer yang menempel. Sebelumnya ia ikut
//     mengalir di akhir konten dan bisa ter-scroll keluar layar.
//   • Label manual → Field/FieldLabel/FieldDescription; input angka →
//     InputGroup dengan satuan di ujung; tabel perbandingan → Table.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PackagePlus, ClipboardCheck } from 'lucide-react';
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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/shared/utils';
import { formatPriceIDR } from '@/lib/shared/format';
import { getErrorMessage } from '@/lib/api/client';
import { useOpname, useRestock } from '@/hooks/dashboard/use-kasir';
import {
  ResponsiveSheet,
  ResponsiveSheetBody,
  ResponsiveSheetContent,
  ResponsiveSheetDescription,
  ResponsiveSheetFooter,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
} from './responsive-sheet';
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

  const [tab, setTab] = useState<'restock' | 'opname'>('restock');
  const [jumlahRestock, setJumlahRestock] = useState('');
  const [stokFisik, setStokFisik] = useState('');
  const [konfirmasiOpname, setKonfirmasiOpname] = useState(false);

  const tutup = () => {
    setJumlahRestock('');
    setStokFisik('');
    setKonfirmasiOpname(false);
    onClose();
  };

  if (!produk) return null;

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

  const pending = restockPending || opnamePending;

  return (
    <>
      <ResponsiveSheet open onOpenChange={(open) => !open && tutup()}>
        <ResponsiveSheetContent>
          <ResponsiveSheetHeader>
            <ResponsiveSheetTitle className="truncate">
              {produk.name}
            </ResponsiveSheetTitle>
            <ResponsiveSheetDescription>
              {t('currentStock', { stok: produk.stok })} ·{' '}
              {t('stockValue', {
                nilai: formatPriceIDR(produk.price * produk.stok),
              })}
            </ResponsiveSheetDescription>
          </ResponsiveSheetHeader>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'restock' | 'opname')}
            className="flex min-h-0 flex-1 flex-col"
          >
            <ResponsiveSheetBody className="space-y-4">
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
              <TabsContent value="restock" className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t('restockHelp')}
                </p>

                <Field>
                  <FieldLabel htmlFor="jumlah-restock">
                    {t('restockLabel')}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="jumlah-restock"
                      inputMode="numeric"
                      value={jumlahRestock}
                      onChange={(e) =>
                        setJumlahRestock(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="0"
                      className="text-lg font-semibold tabular-nums"
                    />
                    <InputGroupAddon align="inline-end">
                      {t('unit')}
                    </InputGroupAddon>
                  </InputGroup>

                  {angkaRestock > 0 && (
                    <FieldDescription aria-live="polite">
                      {t('restockPreview', {
                        sebelum: produk.stok,
                        sesudah: produk.stok + angkaRestock,
                      })}
                    </FieldDescription>
                  )}
                </Field>
              </TabsContent>

              {/* ── Opname ──────────────────────────────────────── */}
              <TabsContent value="opname" className="space-y-3">
                <p className="text-sm text-muted-foreground">{t('opnameHelp')}</p>

                <Field>
                  <FieldLabel htmlFor="stok-fisik">
                    {t('opnameLabel')}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="stok-fisik"
                      inputMode="numeric"
                      value={stokFisik}
                      onChange={(e) =>
                        setStokFisik(e.target.value.replace(/\D/g, ''))
                      }
                      placeholder="0"
                      className="text-lg font-semibold tabular-nums"
                    />
                    <InputGroupAddon align="inline-end">
                      {t('unit')}
                    </InputGroupAddon>
                  </InputGroup>

                  {angkaFisik !== null && (
                    <FieldDescription
                      aria-live="polite"
                      className={cn(
                        selisih === 0
                          ? undefined
                          : selisih > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive',
                      )}
                    >
                      {selisih === 0
                        ? t('opnameNoDiff')
                        : t('opnamePreview', {
                            selisih:
                              selisih > 0 ? `+${selisih}` : `${selisih}`,
                          })}
                    </FieldDescription>
                  )}
                </Field>
              </TabsContent>
            </ResponsiveSheetBody>

            {/* Satu footer untuk kedua tab: tombolnya berada di posisi yang
                sama persis saat kasir berpindah tab, jadi jempolnya tidak
                perlu mencari ulang. */}
            <ResponsiveSheetFooter>
              {tab === 'restock' ? (
                <Button
                  onClick={submitRestock}
                  disabled={angkaRestock < 1 || pending}
                  className="w-full"
                >
                  {restockPending && <Spinner className="mr-2 size-4" />}
                  {restockPending ? t('saving') : t('restockSubmit')}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    perluKonfirmasi ? setKonfirmasiOpname(true) : submitOpname()
                  }
                  disabled={angkaFisik === null || pending}
                  className="w-full"
                >
                  {opnamePending && <Spinner className="mr-2 size-4" />}
                  {opnamePending ? t('saving') : t('opnameSubmit')}
                </Button>
              )}
            </ResponsiveSheetFooter>
          </Tabs>
        </ResponsiveSheetContent>
      </ResponsiveSheet>

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

          <div className="rounded-lg border">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="px-3 text-muted-foreground">
                    {t('bigDiffSystem')}
                  </TableCell>
                  <TableCell className="px-3 text-right font-medium tabular-nums">
                    {produk.stok}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-3 text-muted-foreground">
                    {t('bigDiffPhysical')}
                  </TableCell>
                  <TableCell className="px-3 text-right font-medium tabular-nums">
                    {angkaFisik}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="px-3 text-muted-foreground">
                    {t('bigDiffDelta')}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'px-3 text-right font-bold tabular-nums',
                      selisih > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-destructive',
                    )}
                  >
                    {selisih > 0 ? `+${selisih}` : selisih}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

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
              {opnamePending && <Spinner className="mr-2 size-4" />}
              {t('bigDiffConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
