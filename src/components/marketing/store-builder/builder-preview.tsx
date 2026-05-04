'use client';

// ==========================================
// BUILDER PREVIEW
// File: src/components/marketing/store-builder/builder-preview.tsx
//
// Phase 3 (Interactive Store Builder, May 2026):
//
// Live preview of the storefront. Mirrors visual style of
// shared/storefront-mockup.tsx so visitors who saw the hero recognise
// the form factor — but here it reflects THEIR choices in real time:
//
//   - URL bar: {slug || 'kopi-nusantara'}.fibidy.com
//   - Header brand: name auto-derived from slug, capitalized words
//   - Eyebrow: chosen category label, or placeholder when none picked
//   - 3 product cards: generic placeholders (Q9 = P1)
//   - CTA pill: "Order via WhatsApp" (constant)
//
// Q9 = P1 decision: product cards stay generic ("Produk Anda di sini")
// regardless of category. Effort/polish tradeoff — swapping per-cat
// content would mean curating 30+ product names + descriptions in 2
// locales. Generic copy ships clean today.
//
// Pure presentational client component (uses useTranslations only). No
// state, no effects.
// ==========================================

import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { builderCategories } from '@/lib/data/marketing/store-builder';

interface BuilderPreviewProps {
  /** Selected builder category id, or null when none picked */
  categoryId: string | null;
  /** Current slug — '' means show placeholder */
  slug: string;
}

// ──────────────────────────────────────────────────────────────────
// Helper: turn 'kopi-nusantara' → 'Kopi Nusantara'
// Used for the preview brand name. Pure function, no i18n needed.
// ──────────────────────────────────────────────────────────────────
function deriveStoreName(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function BuilderPreview({ categoryId, slug }: BuilderPreviewProps) {
  const t = useTranslations('marketing.storeBuilder.preview');
  const tCat = useTranslations('marketing.storeBuilder.categoryStep.categories');

  const previewSlug = slug || t('placeholderSlug');
  const previewName =
    deriveStoreName(slug) || t('placeholderName');

  const matched = categoryId
    ? builderCategories.find((c) => c.id === categoryId)
    : null;
  const previewCategory = matched
    ? tCat(matched.id)
    : t('placeholderCategory');

  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-2xl border bg-card shadow-xl shadow-primary/10"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground transition-colors">
          {previewSlug}.fibidy.com
        </div>
      </div>

      {/* Storefront header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            {previewName}
          </span>
        </div>
        <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
          <span>{t('navHome')}</span>
          <span>{t('navProducts')}</span>
          <span>{t('navAbout')}</span>
        </div>
      </div>

      {/* Hero band */}
      <div className="relative bg-gradient-to-br from-primary/12 via-background to-background px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          {previewCategory}
        </p>
        <h4 className="mt-1.5 truncate text-xl font-bold tracking-tight">
          {previewName}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('storeTagline')}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-white">
          <MessageCircle className="h-3 w-3" aria-hidden />
          {t('ctaButton')}
        </div>
      </div>

      {/* Product grid (Q9 = P1, generic placeholders) */}
      <div className="grid grid-cols-3 gap-2.5 p-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border bg-background"
          >
            <div className="relative aspect-square bg-gradient-to-br from-primary/15 to-primary/5" />
            <div className="p-2">
              <p className="truncate text-[11px] font-medium">
                {t('placeholderProduct')}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-primary">
                Rp —
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
