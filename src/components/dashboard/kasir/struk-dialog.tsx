'use client';

// ============================================================================
// STRUK DIALOG
// File: src/components/dashboard/kasir/struk-dialog.tsx
//
// Muncul OTOMATIS setelah pembayaran berhasil — bukan hasil navigasi manual.
// Dua aksi saja: Bagikan dan Selesai.
//
// Tidak ada tombol "Cetak": printer thermal belum didukung, dan tombol yang
// pasti gagal lebih merugikan daripada tombol yang tidak ada.
//
// Teks struk dirender SERVER (renderStrukText), jadi yang dibagikan ke
// pelanggan persis sama dengan yang tersimpan di riwayat.
// ============================================================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { bagikanStruk } from '@/lib/shared/struk-image';

export function StrukDialog({
  open,
  onOpenChange,
  teks,
  nomorOrder,
  onSelesai,
  variant = 'sukses',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teks: string;
  nomorOrder: string;
  /** Dipanggil saat "Selesai" — biasanya untuk mengosongkan keranjang. */
  onSelesai?: () => void;
  /** 'sukses' setelah bayar, 'lihat' saat dibuka dari riwayat. */
  variant?: 'sukses' | 'lihat';
}) {
  const t = useTranslations('dashboard.kasir.struk');
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const hasil = await bagikanStruk(teks, nomorOrder);
      if (hasil === 'copied') toast.success(t('copied'));
      else if (hasil === 'whatsapp') toast.success(t('openedWhatsapp'));
      else if (hasil === 'failed') toast.error(t('shareFailed'));
    } finally {
      setSharing(false);
    }
  };

  const handleSelesai = () => {
    onSelesai?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          {variant === 'sukses' && (
            <div className="mb-2 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                <Check
                  className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
                  aria-hidden
                />
              </div>
            </div>
          )}
          <DialogTitle className="text-center text-base">
            {variant === 'sukses' ? t('successTitle') : t('title')}
          </DialogTitle>
          <DialogDescription className="text-center">
            {nomorOrder}
          </DialogDescription>
        </DialogHeader>

        {/*
          Struk selalu putih-hitam, tidak ikut tema gelap: ini pratinjau
          dari benda fisik, dan hasil bagikannya juga putih-hitam. Kalau
          pratinjau gelap tapi gambarnya terang, kasir akan mengira salah.
        */}
        <ScrollArea className="max-h-[45vh] rounded-lg border bg-white">
          <pre className="whitespace-pre px-3 py-3 font-mono text-[11px] leading-[1.45] text-black">
            {teks}
          </pre>
        </ScrollArea>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleShare}
            disabled={sharing}
            variant="outline"
            className="w-full gap-2"
          >
            {sharing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Share2 className="h-4 w-4" aria-hidden />
            )}
            {sharing ? t('sharing') : t('share')}
          </Button>

          <Button onClick={handleSelesai} className="w-full">
            {variant === 'sukses' ? t('done') : t('close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
