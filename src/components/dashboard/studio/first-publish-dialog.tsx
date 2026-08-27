'use client';

// ============================================================================
// FIRST PUBLISH DIALOG — Studio Flow v3
// File: src/components/dashboard/studio/first-publish-dialog.tsx
//
// [STUDIO FLOW v3 — May 2026]
// Muncul SATU KALI setelah hasPublishedOnce flip false → true.
// Tone: emerald celebration. Non-dismissible — hanya via CTA.
//
// Layout:
//   - Icon PartyPopper emerald
//   - Title: "Toko kamu sudah live! 🎉"
//   - Description: URL live + empati
//   - Hint box: "Mau tampilan berbeda? Bisa ganti block kapan saja"
//   - CTA Primary: "Tambah Produk Pertama" → /dashboard/products
//   - CTA Secondary: "Lihat Toko Saya" → /store/{slug} (new tab)
// ============================================================================

import { useTranslations } from 'next-intl';
import { PartyPopper, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { storeAbsoluteUrl } from '@/lib/public/store-url';
import { useRouter } from '@/i18n/navigation';

interface FirstPublishDialogProps {
  open: boolean;
  storeSlug: string;
  nextPath?: string;
  onContinue?: () => void;
}

export function FirstPublishDialog({
  open,
  storeSlug,
  nextPath = '/dashboard/products',
  onContinue,
}: FirstPublishDialogProps) {
  const t = useTranslations('studio.firstPublishDialog');
  const router = useRouter();

  const handleContinue = () => {
    onContinue?.();
    router.push(nextPath);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button:last-child]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          {/* ── Celebration icon ── */}
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
              <PartyPopper className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <DialogTitle className="text-center text-display-sm">
            {t('title')}
          </DialogTitle>

          <DialogDescription asChild>
            <div className="space-y-3 pt-1 text-center">
              {/* Store URL live */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('description', { slug: storeSlug })}
              </p>

              {/* Empati explore block */}
              <div className="rounded-lg bg-muted/50 border px-4 py-3 text-left">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  💡 {t('exploreHint')}
                </p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-3 flex-col gap-2 sm:flex-col">
          {/* Primary: dorong ke produk */}
          <Button onClick={handleContinue} className="w-full gap-2">
            {t('ctaContinue')}
            <ArrowRight className="h-4 w-4" />
          </Button>

          {/* Secondary: lihat toko live */}
          <Button variant="outline" asChild className="w-full">
            <a href={storeAbsoluteUrl(storeSlug)}>
              {t('ctaPreview')}
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
