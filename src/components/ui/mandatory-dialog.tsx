'use client';

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

// ============================================================================
// MANDATORY DIALOG — Shared Shell
// File: src/components/ui/mandatory-dialog.tsx
//
// [LOTTIE UPDATE — May 2026] AlertDialog + Lottie, hapus icon prop.
// [TYPECHECK FIX — May 2026] Hapus onInteractOutside — AlertDialogContent
// tidak expose prop ini. AlertDialog (Radix) sudah modal=true by default,
// outside clicks diblock tanpa prop tambahan.
// ============================================================================

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import alertLottie from '../../../public/lotties/alert.json';

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
  onAfterClose?: () => void;
  testId?: string;
}

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

  const handlePrimaryAction = () => {
    primaryCta.onClick();
    if (onAfterClose) setTimeout(onAfterClose, 150);
  };

  return (
    <AlertDialog open={open} onOpenChange={() => {}}>
      <AlertDialogContent
        className="sm:max-w-sm p-0 overflow-hidden"
        data-testid={testId}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex justify-center items-center pt-6 pb-2">
          <Lottie
            animationData={alertLottie}
            loop={true}
            autoplay={true}
            style={{ width: 160, height: 160 }}
            rendererSettings={{ viewBoxOnly: true }}
          />
        </div>

        <AlertDialogHeader className="px-6 pb-2">
          <AlertDialogTitle className="text-base font-semibold text-center">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription
            asChild={typeof description !== 'string'}
            className="text-sm text-center pt-1 leading-relaxed"
          >
            {typeof description === 'string' ? description : <div>{description}</div>}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="px-6 pb-6 pt-2 flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handlePrimaryAction}
            className={cn('w-full', showArrow && 'gap-2')}
          >
            {primaryCta.label}
            {showArrow && <ArrowRight className="h-4 w-4" aria-hidden />}
          </AlertDialogAction>

          {secondaryCta && (
            secondaryCta.href ? (
              <AlertDialogCancel asChild className="w-full mt-0">
                <a href={secondaryCta.href} target="_blank" rel="noopener noreferrer">
                  {secondaryCta.label}
                </a>
              </AlertDialogCancel>
            ) : (
              <AlertDialogCancel onClick={secondaryCta.onClick} className="w-full mt-0">
                {secondaryCta.label}
              </AlertDialogCancel>
            )
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
