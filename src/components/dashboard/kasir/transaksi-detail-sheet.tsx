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
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Ban, Loader2, RotateCcw } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
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

  return (
    <>
      <Sheet
        open={!!transaksiId}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {trx?.nomorOrder ?? t('detailTitle')}
              {trx && <StatusTransaksiBadge status={trx.status} />}
            </SheetTitle>
            <SheetDescription>
              {trx
                ? new Date(trx.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : ''}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 pb-6">
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
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {formatPriceIDR(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rincian angka */}
                <dl className="space-y-1 border-t pt-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t('subtotal')}</dt>
                    <dd className="tabular-nums">{formatPriceIDR(trx.subtotal)}</dd>
                  </div>
                  {trx.diskonNominal > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {t('discount', { persen: trx.diskonPersen })}
                      </dt>
                      <dd className="tabular-nums">
                        −{formatPriceIDR(trx.diskonNominal)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-1 font-bold">
                    <dt>{t('total')}</dt>
                    <dd className="tabular-nums">
                      {formatPriceIDR(trx.grandTotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between pt-1">
                    <dt className="text-muted-foreground">{t('method')}</dt>
                    <dd>{trx.paymentMethod}</dd>
                  </div>
                  {trx.uangDiterima != null && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">{t('cash')}</dt>
                        <dd className="tabular-nums">
                          {formatPriceIDR(trx.uangDiterima)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">{t('change')}</dt>
                        <dd className="tabular-nums">
                          {formatPriceIDR(trx.kembalian ?? 0)}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>

                {/* Aksi */}
                <div className="space-y-2 border-t pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setStrukOpen(true)}
                    disabled={!struk}
                  >
                    {t('viewStruk')}
                  </Button>

                  {/* Void/refund hanya masuk akal untuk transaksi yang masih
                      berlaku — status lain tidak menampilkan tombolnya sama
                      sekali, bukan menampilkan tombol yang pasti ditolak. */}
                  {trx.status === 'COMPLETED' && (
                    <div className="grid grid-cols-2 gap-2">
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
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Konfirmasi void/refund */}
      <AlertDialog open={!!aksi} onOpenChange={(open) => !open && tutupAksi()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {aksi === 'void' ? t('voidConfirmTitle') : t('refundConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {aksi === 'void'
                ? t('voidConfirmDescription')
                : t('refundConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5">
            <label htmlFor="alasan" className="text-sm font-medium">
              {aksi === 'refund' ? t('reasonRequiredLabel') : t('reasonLabel')}
            </label>
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
              className={alasanError ? 'border-destructive' : undefined}
            />
            {alasanError && (
              <p className="text-xs text-destructive">{alasanError}</p>
            )}
          </div>

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
              {pending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
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
    </>
  );
}
