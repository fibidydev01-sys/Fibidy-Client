'use client';

// ============================================================================
// SELLER SETUP DONE — Success Screen
// File: client/src/app/[locale]/(dashboard)/dashboard/setup-store/seller/seller-setup-done.tsx
//
// [PHASE C v2 — May 2026]
// CTA "Bangun Storefront" → buka SetupDoneDialog dulu (mandatory).
// Dialog tidak bisa ditutup via backdrop atau Escape.
// User HARUS klik "Lanjut ke Studio" untuk proceed.
//
// Flow: SetupDone → SetupDoneDialog → router.push('/dashboard/studio')
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Palette, ArrowRight, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ── SetupDoneDialog ───────────────────────────────────────────────────────────
// Hard dialog — tidak bisa ditutup via backdrop atau Escape.
// Seller harus acknowledge bahwa next step adalah Studio.

function SetupDoneDialog({
  open,
  onContinue,
}: {
  open: boolean;
  onContinue: () => void;
}) {
  const t = useTranslations('dashboard.setupStore.seller.done.goToStudioDialog');

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        // Intentionally empty — cannot be closed by outside click
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        // Disable escape key close
        onEscapeKeyDown={(e) => e.preventDefault()}
        // Disable backdrop click close
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-lg leading-snug">{t('title')}</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed pl-[52px]">
            {t('description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2">
          <Button
            onClick={onContinue}
            className="w-full sm:w-auto gap-2"
          >
            {t('cta')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── SellerSetupDone ───────────────────────────────────────────────────────────

export function SellerSetupDone() {
  const t = useTranslations('dashboard.setupStore.seller.done');
  const router = useRouter();
  const tenant = useAuthStore((s) => s.tenant);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleContinueToStudio = () => {
    setDialogOpen(false);
    router.push('/dashboard/studio');
  };

  return (
    <>
      <div className="max-w-md mx-auto text-center py-12 space-y-6">

        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="px-4 text-sm leading-relaxed text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          {/* Primary CTA — opens mandatory dialog */}
          <Button
            onClick={() => setDialogOpen(true)}
            size="lg"
            className="w-full gap-2 h-12 text-base font-semibold"
          >
            <Palette className="h-4 w-4" />
            {t('ctaBuildStore')}
            <ArrowRight className="h-4 w-4" />
          </Button>

          {/* Secondary — preview store */}
          {tenant?.slug && (
            <Button asChild variant="outline" size="lg" className="w-full gap-2 h-12">
              <Link href={`/${tenant.slug}`} target="_blank">
                <Eye className="h-4 w-4" />
                {t('ctaPreview')}
              </Link>
            </Button>
          )}
        </div>

        <p className="pt-3 text-xs text-muted-foreground/70">{t('helpFooter')}</p>
      </div>

      {/* Mandatory dialog — no escape, no backdrop close */}
      <SetupDoneDialog open={dialogOpen} onContinue={handleContinueToStudio} />
    </>
  );
}
