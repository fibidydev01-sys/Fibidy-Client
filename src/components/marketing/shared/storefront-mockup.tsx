'use client';

// ==========================================
// STOREFRONT MOCKUP (BODY — wrapped by BrowserMockup in hero-section)
// File: src/components/marketing/shared/storefront-mockup.tsx
//
// Phase 5 polish v12 (May 2026 — i18n localized):
//
// CHANGED:
//   STOREFRONT_MORPH array no longer hardcoded. Pulled from i18n
//   key `marketing.storeBuilder.preview.morph` with defensive cast.
//   Previously: EN locale visitor saw hero "Open your..." but mockup
//   "Buka kedai kopimu." — two languages on one screen. Now both
//   layers honor the active locale.
//
// PRESERVED from v11:
//   - 'use client' (MorphingText needs hooks)
//   - Hero band: centered MorphingText on coffee-shop image
//   - Symmetric bg-black/55 overlay for centered-text contrast
//   - Product grid: name + price only
//   - All <img> decorative; aria-hidden context
//   - Empty header divider bar (no icon, no nav text)
// ==========================================

import { useTranslations } from 'next-intl';
import { MorphingText } from '@/components/ui/morphing-text';
import { cn } from '@/lib/shared/utils';

const COFFEE_SHOP_HERO =
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1200&q=80';

const PRODUCTS = [
  {
    name: 'House Blend',
    price: 'Rp 85.000',
    img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Gayo 250g',
    price: 'Rp 110.000',
    img: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Cold Brew',
    price: 'Rp 35.000',
    img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=400&q=80',
  },
] as const;

export function StorefrontMockup() {
  const t = useTranslations('marketing.storeBuilder.preview');

  // Pull localized morph array. Defensive cast — if i18n drifts and
  // the key isn't an array, fall back to a single-phrase array so
  // MorphingText has something to render.
  const morphRaw = t.raw('morph');
  const morphTexts: string[] = Array.isArray(morphRaw)
    ? (morphRaw as string[])
    : ['Open your store.'];

  return (
    <div aria-hidden className="flex flex-col bg-card">
      {/*
        Empty header bar — content (icon, name, nav) all removed.
        Border-bottom kept as a visual separator between browser
        chrome and the hero band image.
      */}
      <div className="border-b px-5 py-3" />

      {/*
        Hero band — centered MorphingText on coffee-shop image.
        Symmetrical dark overlay so centered text has uniform
        contrast on either side.
      */}
      <div className="relative h-44 overflow-hidden sm:h-52">
        <img
          src={COFFEE_SHOP_HERO}
          alt=""
          loading="eager"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />

        <div className="relative flex h-full items-center justify-center px-5">
          <MorphingText
            texts={morphTexts}
            className={cn(
              // Reset Magic UI's mx-auto + max-w-screen-md
              '!mx-0 !w-full !max-w-none',
              // Compact heights tuned for the mockup band (~200px tall).
              // MorphingText's children are absolutely positioned, so
              // explicit container height is required or it collapses.
              '!h-12 sm:!h-14',
              // Font scale — readable inside the constrained mockup
              // (max-w-[640px] in hero-section). 24px / 30px keeps the
              // longest variant (~18 chars) on one line.
              '!text-2xl sm:!text-3xl',
              '!font-bold !tracking-tight !leading-tight',
              '!text-white !text-center',
            )}
          />
        </div>
      </div>

      {/* Product grid — name + price only */}
      <div className="grid grid-cols-3 gap-2.5 p-4">
        {PRODUCTS.map((p) => (
          <div
            key={p.name}
            className="overflow-hidden rounded-lg border bg-background"
          >
            <div className="relative aspect-square overflow-hidden bg-muted">
              <img
                src={p.img}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-2">
              <p className="truncate text-[11px] font-medium">{p.name}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-primary">
                {p.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
