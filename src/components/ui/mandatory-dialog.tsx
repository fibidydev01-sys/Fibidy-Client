'use client';

// ============================================================================
// MANDATORY DIALOG — Shared Shell
// File: src/components/ui/mandatory-dialog.tsx
//
// [LOTTIE UPDATE — May 2026]
// Migrate dari Dialog → AlertDialog (pattern identik ValidationDialog).
// Tambah Lottie animation (alert.json) di atas title.
// Hapus [&>button:last-child]:hidden CSS hack — AlertDialog tidak punya X button.
// Hapus icon prop — digantikan Lottie animation.
//
// [SCROLL FIX — carry-forward dari ValidationDialog]
// onAfterClose?: () => void — dipanggil 150ms setelah primary CTA diklik,
// setelah dialog close animation selesai, untuk scrollIntoView ke field error.
// Pattern identik ValidationDialog.handleAction().
//
// Layout: Lottie → title → description → footer CTA
// ============================================================================

import dynamic from 'next/dynamic';
import { ArrowRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/shared/utils';

// Dynamic import — lottie-react pakai browser API, tidak bisa SSR
// Pattern identik ValidationDialog
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

// alert.json — sama dengan ValidationDialog, sudah ada di public/lotties/
import alertLottie from '../../../public/lotties/alert.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MandatoryDialogCta {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface PrimaryCta {
  label: string;
  onClick: () => void;
  showArrow?: boolean;
}

export interface MandatoryDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  primaryCta: PrimaryCta;
  secondaryCta?: MandatoryDialogCta;
  /**
   * [SCROLL FIX] Dipanggil setelah dialog close animation selesai (150ms delay).
   * Gunakan untuk scrollIntoView ke field error pertama di DOM.
   * Pattern identik ValidationDialog.onAfterClose.
   */
  onAfterClose?: () => void;
  testId?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MandatoryDialog({
  open,
  title,
  description,
  primaryCta,
  secondaryCta,
  onAfterClose,
  testId,
}: MandatoryDialogProps) {
  const showArrow = primaryCta.showArrow ?? true;

  // [SCROLL FIX] Identik ValidationDialog.handleAction()
  // onClose → tunggu 150ms animasi selesai → panggil onAfterClose
  const handlePrimaryAction = () => {
    primaryCta.onClick();
    if (onAfterClose) {
      setTimeout(onAfterClose, 150);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={() => {
        // Intentionally locked — close only via CTA
      }}
    >
      <AlertDialogContent
        className="sm:max-w-sm p-0 overflow-hidden"
        data-testid={testId}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >

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

        {/* ── Title + Description ──────────────────────────────────────── */}
        <AlertDialogHeader className="px-6 pb-2">
          <AlertDialogTitle className="text-base font-semibold text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            asChild={typeof description !== 'string'}
            className="text-sm text-center pt-1 leading-relaxed"
          >
            {typeof description === 'string' ? (
              description
            ) : (
              <div>{description}</div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <AlertDialogFooter className="px-6 pb-6 pt-2 flex-col gap-2 sm:flex-col">
          {/* Primary CTA */}
          <AlertDialogAction
            onClick={handlePrimaryAction}
            className={cn('w-full', showArrow && 'gap-2')}
          >
            {primaryCta.label}
            {showArrow && <ArrowRight className="h-4 w-4" aria-hidden />}
          </AlertDialogAction>

          {/* Secondary CTA — optional */}
          {secondaryCta && (
            secondaryCta.href ? (
              <AlertDialogCancel asChild className="w-full mt-0">
                <a
                  href={secondaryCta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {secondaryCta.label}
                </a>
              </AlertDialogCancel>
            ) : (
              <AlertDialogCancel
                onClick={secondaryCta.onClick}
                className="w-full mt-0"
              >
                {secondaryCta.label}
              </AlertDialogCancel>
            )
          )}
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}