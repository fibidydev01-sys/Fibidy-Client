'use client';

// ==========================================
// PRODUCT ACTIONS — Adaptive
// File: src/components/store/product/product-actions.tsx
//
// [EDU MODE — May 2026]
// Saat tenant.isEduMode === true:
//   - Tombol pesan TIDAK ditampilkan
//   - Diganti EduOrderDialog — info bahwa ini simulation store
//   - Tombol tetap ada (tidak dihilangkan) agar UX tidak broken
//
// [PANGKAS PRODUK DIGITAL]
// Tinggal satu jalur: pesan lewat WhatsApp. Percabangan digital/fisik dan
// tombol checkout Stripe sudah dicabut.
//
// [IDR MIGRATION — May 2026]
// Default to IDR uniformly.
// ==========================================

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GraduationCap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { WhatsAppOrderButton } from '../checkout/whatsapp-order-button';
import type { Product } from '@/types/product';
import type { PublicTenant } from '@/types/tenant';
import { MarkdownText } from '@/components/store/shared/markdown-text';

// ── EduOrderDialog ────────────────────────────────────────────────────────────

function EduOrderDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('store.eduOrder');

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden />
            </div>
          </div>
          <AlertDialogTitle className="text-center">
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center leading-relaxed">
            {t('description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction onClick={onClose} className="w-full">
            {t('understood')}
          </AlertDialogAction>
          <AlertDialogCancel asChild className="w-full mt-0">
            <a
              href="https://guide.fibidy.com/edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5"
            >
              {t('learnMore')}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── ProductActions ────────────────────────────────────────────────────────────

interface ProductActionsProps {
  product: Product;
  tenant: PublicTenant;
}

export function ProductActions({ product, tenant }: ProductActionsProps) {
  const t = useTranslations('store.product.detail');
  const tCheckout = useTranslations('store.checkout');
  const isEdu = tenant.isEduMode === true;

  const [eduDialogOpen, setEduDialogOpen] = useState(false);

  // ── EDU mode — semua tombol beli diganti satu tombol → dialog ─────────────

  if (isEdu) {
    return (
      <div className="space-y-4">
        {/* Tombol beli — trigger EduOrderDialog, bukan order sungguhan */}
        <Button
          className="w-full gap-2"
          onClick={() => setEduDialogOpen(true)}
        >
          <GraduationCap className="h-4 w-4" aria-hidden />
          {tCheckout('simulateOrder')}
        </Button>

        <EduOrderDialog
          open={eduDialogOpen}
          onClose={() => setEduDialogOpen(false)}
        />

        {/* Description tetap tampil */}
        {product.description && (
          <div className="space-y-1">
            <p className="text-sm font-semibold">{t('descriptionHeading')}</p>
            <MarkdownText className="text-sm text-muted-foreground">
              {product.description}
            </MarkdownText>
          </div>
        )}
      </div>
    );
  }

  // ── Normal mode ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <WhatsAppOrderButton
        product={product}
        tenant={tenant}
        className="w-full"
      />

      {product.description && (
        <div className="space-y-1">
          <p className="text-sm font-semibold">{t('descriptionHeading')}</p>
          <MarkdownText className="text-sm text-muted-foreground">
            {product.description}
          </MarkdownText>
        </div>
      )}
    </div>
  );
}