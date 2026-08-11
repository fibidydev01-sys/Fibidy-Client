'use client';

// ============================================================================
// DETAIL TRANSAKSI
// File: src/components/dashboard/kasir/transaksi-detail-sheet.tsx
//
// Dibuka dari baris riwayat. Isinya: pratinjau struk lengkap + aksi.
//
// Void vs Refund sengaja dipisah sebagai dua tombol dengan konsekuensi
// berbeda, bukan satu tombol "batalkan":
//   VOID   → salah input. Stok TIDAK dikembalikan (barang mungkin sudah keluar).
//   REFUND → pelanggan mengembalikan barang. Stok DIKEMBALIKAN.
// Perbedaan itu ditulis di layar, bukan diserahkan ke ingatan kasir.
//
// Keduanya memakai dialog konfirmasi bergaya aplikasi karena tidak bisa
// dibatalkan, dan refund wajib mengisi alasan.
//
// [UI/UX — Agu 2026]
//   • Drawer di ponsel, Sheet di desktop (ResponsiveSheet).
//   • Aksi pindah ke footer yang menempel — pada transaksi dengan sepuluh item,
//     tombol "Terima Pembayaran" dulu berada jauh di bawah lipatan.
//   • Rincian angka jadi <Table>, alasan void/refund jadi Field + FieldError.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, Clock, RotateCcw, Wallet } from 'lucide-react';
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
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatPriceIDR } from '@/lib/shared/format';
import { getErrorMessage } from '@/lib/api/client';
import {
  useRefundTransaksi,
  useStruk,
  useTransaksi,
  useVoidTransaksi,
} from '@/hooks/dashboard/use-kasir';
import { StatusTransaksiBadge } from './kasir-badges';
import { StrukDialog } from './struk-dialog';
import { TerimaPembayaranDialog } from './terima-pembayaran-dialog';
import {
  ResponsiveSheet,
  ResponsiveSheetBody,
  ResponsiveSheetContent,
  ResponsiveSheetDescription,
  ResponsiveSheetFooter,
  ResponsiveSheetHeader,
  ResponsiveSheetTitle,
} from './responsive-sheet';

export function TransaksiDetailSheet({
  transaksiId,
  onClose,
}: {
  transaksiId: string | null;
  onClose: () => void;
}) {
  const t = useTranslations('dashboard.kasir.riwayat');
  const tStruk = useTranslations('dashboard.kasir.struk');

  const { data: trx, isLoading } = useTransaksi(transaksiId ?? undefined);
  const { data: struk } = useStruk(transaksiId ?? undefined);

  const { mutate: voidTrx, isPending: voidPending } = useVoidTransaksi();
  const { mutate: refundTrx, isPending: refundPending } = useRefundTransaksi();

  const [aksi, setAksi] = useState<'void' | 'refund' | null>(null);
  const [alasan, setAlasan] = useState('');
  const [alasanError, setAlasanError] = useState<string | null>(null);
  const [strukOpen, setStrukOpen] = useState(false);
  const [bayarOpen, setBayarOpen] = useState(false);
  // Struk hasil pelunasan datang dari respons server, bukan dari query struk
  // yang mungkin masih memegang versi "TANDA TERIMA" yang lama.
  const [strukLunas, setStrukLunas] = useState<string | null>(null);

  const tutupAksi = () => {
    setAksi(null);
    setAlasan('');
    setAlasanError(null);
  };

  const jalankanAksi = () => {
    if (!transaksiId) return;

    if (aksi === 'refund' && !alasan.trim()) {
      // Validasi per-field di bawah field-nya, bukan pesan umum di bawah form.
      setAlasanError(t('reasonRequired'));
      return;
    }

    const onError = (err: unknown) => toast.error(getErrorMessage(err));

    if (aksi === 'void') {
      voidTrx(
        { id: transaksiId, alasan: alasan.trim() || undefined },
        { onSuccess: () => { tutupAksi(); onClose(); }, onError },
      );
    } else if (aksi === 'refund') {
      refundTrx(
        { id: transaksiId, alasan: alasan.trim() },
        { onSuccess: () => { tutupAksi(); onClose(); }, onError },
      );
    }
  };

  const pending = voidPending || refundPending;

  // Void pada pesanan yang belum dibayar secara teknis endpoint yang sama,
  // tapi konsekuensinya berbeda: tidak ada uang yang ditarik kembali dan omzet
  // tidak bergerak sedikit pun. Memakai kalimat "dikeluarkan dari rekap omzet"
  // di situ akan membuat kasir mengira ada angka yang hilang.
  const membatalkanPesanan = aksi === 'void' && trx?.status === 'BELUM_BAYAR';

  const barisAngka = (label: string, nilai: React.ReactNode, tebal = false) => (
    <TableRow>
      <TableCell className="px-0 text-muted-foreground">{label}</TableCell>
      <TableCell
        className={`px-0 text-right tabular-nums ${tebal ? 'font-bold' : ''}`}
      >
        {nilai}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <ResponsiveSheet
        open={!!transaksiId}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <ResponsiveSheetContent>
          <ResponsiveSheetHeader>
            <ResponsiveSheetTitle className="flex items-center gap-2">
              {trx?.nomorOrder ?? t('detailTitle')}
              {trx && <StatusTransaksiBadge status={trx.status} />}
            </ResponsiveSheetTitle>
            <ResponsiveSheetDescription>
              {trx
                ? new Date(trx.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : ''}
            </ResponsiveSheetDescription>
          </ResponsiveSheetHeader>

          <ResponsiveSheetBody className="space-y-4">
            {isLoading || !trx ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <>
                {/* Alasan void/refund — jawaban pertama yang dicari orang
                    saat membuka transaksi yang tidak normal. */}
                {trx.status !== 'COMPLETED' && trx.voidReason && (
                  <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t('reasonLabel')}
                    </p>
                    <p className="mt-0.5 text-sm">{trx.voidReason}</p>
                  </div>
                )}

                {/* Item */}
                <div className="space-y-1.5">
                  {trx.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">
                          {item.namaProduk}
                          {item.itemType === 'PROMO_FREE' && (
                            <span className="ml-1 text-blue-600 dark:text-blue-400">
                              ({tStruk('freeLabel')})
                            </span>
                          )}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {item.qty} ×{' '}
                          {formatPriceIDR(
                            item.itemType === 'PROMO_FREE' ? 0 : item.hargaSatuan,
                          )}
                        </span>
                        {item.itemKind === 'JASA' && item.estimasiSelesai && (
                          <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" aria-hidden />
                            {t('estimasi', {
                              waktu: new Date(
                                item.estimasiSelesai,
                              ).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              }),
                            })}
                            {item.picNama ? ` · ${item.picNama}` : ''}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatPriceIDR(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Rincian angka */}
                <Table>
                  <TableBody>
                    {barisAngka(t('subtotal'), formatPriceIDR(trx.subtotal))}
                    {trx.diskonNominal > 0 &&
                      barisAngka(
                        t('discount', { persen: trx.diskonPersen }),
                        `−${formatPriceIDR(trx.diskonNominal)}`,
                      )}
                    {barisAngka(
                      t('total'),
                      formatPriceIDR(trx.grandTotal),
                      true,
                    )}
                    {barisAngka(
                      t('method'),
                      trx.paymentMethod ?? t('unpaidMethod'),
                    )}
                    {trx.uangDiterima != null && (
                      <>
                        {barisAngka(
                          t('cash'),
                          formatPriceIDR(trx.uangDiterima),
                        )}
                        {barisAngka(
                          t('change'),
                          formatPriceIDR(trx.kembalian ?? 0),
                        )}
                      </>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </ResponsiveSheetBody>

          {/* Aksi — menempel di bawah, tidak ikut ter-scroll bersama item. */}
          {trx && !isLoading && (
            <ResponsiveSheetFooter>
              {/* [JASA] Aksi paling penting untuk pesanan yang belum
                  dibayar, jadi ia berdiri sendiri di atas dan berwarna
                  penuh — bukan berdesakan dengan Void/Refund. */}
              {trx.status === 'BELUM_BAYAR' && (
                <Button className="w-full gap-2" onClick={() => setBayarOpen(true)}>
                  <Wallet className="h-4 w-4" aria-hidden />
                  {t('terimaPembayaran')}
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStrukOpen(true)}
                disabled={!struk}
              >
                {trx.status === 'BELUM_BAYAR'
                  ? t('viewTandaTerima')
                  : t('viewStruk')}
              </Button>

              {/* Void/refund hanya masuk akal untuk transaksi yang masih
                  berlaku — status lain tidak menampilkan tombolnya sama
                  sekali, bukan menampilkan tombol yang pasti ditolak.
                  Refund TIDAK ditawarkan untuk pesanan belum bayar: tidak
                  ada uang yang pernah diterima untuk dikembalikan, dan
                  yang dimaksud kasir hampir pasti "batal pesanan". */}
              {trx.status === 'COMPLETED' && (
                <div className="grid w-full grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setAksi('void')}
                  >
                    <Ban className="h-3.5 w-3.5" aria-hidden />
                    {t('void')}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setAksi('refund')}
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    {t('refund')}
                  </Button>
                </div>
              )}

              {trx.status === 'BELUM_BAYAR' && (
                <Button
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() => setAksi('void')}
                >
                  <Ban className="h-3.5 w-3.5" aria-hidden />
                  {t('batalPesanan')}
                </Button>
              )}
            </ResponsiveSheetFooter>
          )}
        </ResponsiveSheetContent>
      </ResponsiveSheet>

      {/* Konfirmasi void/refund */}
      <AlertDialog open={!!aksi} onOpenChange={(open) => !open && tutupAksi()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {membatalkanPesanan
                ? t('batalConfirmTitle')
                : aksi === 'void'
                  ? t('voidConfirmTitle')
                  : t('refundConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {membatalkanPesanan
                ? t('batalConfirmDescription')
                : aksi === 'void'
                  ? t('voidConfirmDescription')
                  : t('refundConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Field data-invalid={!!alasanError}>
            <FieldLabel htmlFor="alasan">
              {aksi === 'refund' ? t('reasonRequiredLabel') : t('reasonLabel')}
            </FieldLabel>
            <Textarea
              id="alasan"
              value={alasan}
              onChange={(e) => {
                setAlasan(e.target.value);
                if (alasanError) setAlasanError(null);
              }}
              rows={3}
              maxLength={200}
              placeholder={t('reasonPlaceholder')}
              aria-invalid={!!alasanError}
            />
            {alasanError && <FieldError>{alasanError}</FieldError>}
          </Field>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                // preventDefault: dialog tidak boleh tertutup sebelum
                // validasi alasan lolos dan permintaan selesai.
                e.preventDefault();
                jalankanAksi();
              }}
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending && <Spinner className="mr-2 size-4" />}
              {pending ? t('processing') : t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {struk && (
        <StrukDialog
          open={strukOpen}
          onOpenChange={setStrukOpen}
          teks={struk.teks}
          nomorOrder={struk.nomorOrder}
          variant="lihat"
        />
      )}

      {/* Struk lunas: dibuka otomatis setelah pembayaran diterima, memakai
          teks dari respons pelunasan — bukan dari cache struk tanda terima. */}
      {strukLunas && trx && (
        <StrukDialog
          open
          onOpenChange={(o) => !o && setStrukLunas(null)}
          teks={strukLunas}
          nomorOrder={trx.nomorOrder}
          onSelesai={() => {
            setStrukLunas(null);
            onClose();
          }}
        />
      )}

      {trx && trx.status === 'BELUM_BAYAR' && (
        <TerimaPembayaranDialog
          open={bayarOpen}
          onOpenChange={setBayarOpen}
          transaksiId={trx.id}
          nomorOrder={trx.nomorOrder}
          grandTotal={trx.grandTotal}
          onLunas={(s) => setStrukLunas(s)}
        />
      )}
    </>
  );
}
