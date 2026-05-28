'use client';

// ============================================================================
// VALIDATION DIALOG — Shared Hard Dialog
// File: src/components/ui/validation-dialog.tsx
//
// [LOTTIE UPDATE — May 2026]
// Tambah Lottie animation (alert.json = lonceng) di tengah atas dialog.
// Layout: Lottie square → teks error di bawah → tombol OK.
//
// [SCROLL FIX — Sprint 5]
// onAfterClose?: () => void — dipanggil 150ms setelah OK diklik,
// setelah dialog close animation selesai, untuk scrollIntoView.
//
// [DIALOG FIX — May 2026]
// - 1 item: plain text, tanpa dot
// - 2+ item: dot list
// - Footer: satu tombol OK
// ============================================================================

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

// Dynamic import agar Lottie tidak masuk SSR bundle
// (lottie-react pakai browser API — window, requestAnimationFrame, dll)
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// alert.json ada di client/public/lotties/alert.json
// Next.js serve /public sebagai root, jadi path: '/lotties/alert.json'
// Tapi lebih aman import langsung sebagai JSON agar di-bundle
import alertLottie from '../../../public/lotties/alert.json';

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  items: string[];
  /**
   * [SCROLL FIX] Dipanggil setelah dialog close animation selesai (150ms delay).
   * Gunakan untuk scrollIntoView ke field error pertama di DOM.
   * Tidak dipakai oleh upload-guard dialog.
   */
  onAfterClose?: () => void;
}

export function ValidationDialog({
  open,
  onClose,
  items,
  onAfterClose,
}: ValidationDialogProps) {
  const t = useTranslations('common.validationDialog');

  if (items.length === 0) return null;

  const isSingle = items.length === 1;

  const handleAction = () => {
    onClose();
    if (onAfterClose) {
      setTimeout(onAfterClose, 150);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <AlertDialogContent className="sm:max-w-sm p-0 overflow-hidden">

        {/* ── Lottie area ─────────────────────────────────────────────── */}
        <div className="flex justify-center items-center pt-6 pb-2">
          <Lottie
            animationData={alertLottie}
            loop={true}
            autoplay={true}
            style={{ width: 160, height: 160 }}
            rendererSettings={{
              viewBoxOnly: true,
            }}
          />
        </div>

        {/* ── Error list ───────────────────────────────────────────────── */}
        <AlertDialogHeader className="px-6 pb-2">
          <AlertDialogDescription asChild>
            {isSingle ? (
              <p className="text-sm text-foreground text-center">
                {items[0]}
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-sm text-foreground"
                  >
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                    <span className="leading-5">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <AlertDialogFooter className="px-6 pb-6 pt-2">
          <AlertDialogAction onClick={handleAction} className="w-full">
            {t('cta')}
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}