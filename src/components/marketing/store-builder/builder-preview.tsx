'use client';

// ==========================================
// BUILDER PREVIEW (BODY — wrapped by BrowserMockup in section)
// File: src/components/marketing/store-builder/builder-preview.tsx
//
// Phase 5 (Magic UI polish, May 2026 — CEO unlock, REVISION):
//
// E-commerce vibes redesign. Header + ONE big hero banner.
// No product cards — those read as "stub data" when the visitor hasn't
// uploaded anything yet. Instead, the banner image swaps dynamically
// based on the chosen category, pulling real photography from Unsplash.
// Visitor picks "Coffee Shop" → banner becomes a coffee shop. Picks
// "Fashion" → banner becomes a fashion store. Etc.
//
// This mirrors how a Shopify / Squarespace template demo feels — you
// see your STORE, not a stub product grid.
//
// Pure presentational client component (uses useTranslations only).
// No state, no effects.
//
// CHANGED v15.5:
//   - Placeholder bg (no category picked) sekarang pakai
//     `bg-secondary` dari global CSS — no hardcode gradient.
//     Otomatis ikut light/dark mode via CSS variable.
// ==========================================

import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/shared/utils';
import {
  builderCategories,
  categoryVisuals,
} from '@/lib/data/marketing/store-builder';

interface BuilderPreviewProps {
  /** Selected builder category id, or null when none picked */
  categoryId: string | null;
  /** Current slug — '' means show placeholder */
  slug: string;
}

// ──────────────────────────────────────────────────────────────────
// Helper: turn 'kopi-nusantara' → 'Kopi Nusantara'
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
  const tCat = useTranslations(
    'marketing.storeBuilder.categoryStep.categories',
  );

  const previewName = deriveStoreName(slug) || t('placeholderName');

  const matched = categoryId
    ? builderCategories.find((c) => c.id === categoryId)
    : null;
  const previewCategory = matched
    ? tCat(matched.id)
    : t('placeholderCategory');

  // Resolve dynamic visual treatment. When no category picked, fall
  // back to a neutral placeholder banner.
  const visual = matched ? categoryVisuals[matched.visualKey] : null;
  const bannerImage = visual?.bannerImage ?? null;
  const bannerEyebrow = visual?.bannerEyebrowKey
    ? t(visual.bannerEyebrowKey)
    : t('placeholderEyebrow');
  const bannerTagline = visual?.bannerTaglineKey
    ? t(visual.bannerTaglineKey)
    : t('storeTagline');

  return (
    <div aria-hidden className="flex flex-col bg-card">
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

      {/* Hero banner — full-bleed image with overlay text */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        {bannerImage ? (
          <img
            key={bannerImage}
            src={bannerImage}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          />
        ) : (
          // No category picked — pakai bg-secondary (pink blush dari CSS var, ikut dark mode)
          <div className="absolute inset-0 bg-secondary" />
        )}

        {/* Gradient overlay for text legibility — only when image is present */}
        {bannerImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/10" />
        )}

        {/* Banner content — hero copy + CTA */}
        <div
          className={cn(
            'relative flex h-full flex-col justify-end px-6 py-6',
            bannerImage ? 'text-white' : 'text-foreground',
          )}
        >
          <p
            className={cn(
              'text-[10px] font-semibold uppercase tracking-[0.18em]',
              bannerImage ? 'text-white/85' : 'text-muted-foreground',
            )}
          >
            {previewCategory}
          </p>
          <h4 className="mt-1.5 truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {previewName}
          </h4>
          <p
            className={cn(
              'mt-1.5 max-w-md text-sm',
              bannerImage ? 'text-white/85' : 'text-muted-foreground',
            )}
          >
            {bannerTagline}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {t('ctaButton')}
            </div>
            <span
              className={cn(
                'hidden text-[11px] sm:inline',
                bannerImage ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              {bannerEyebrow}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}