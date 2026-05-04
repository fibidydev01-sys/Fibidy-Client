// ==========================================
// STOREFRONT MOCKUP
// File: src/components/marketing/shared/storefront-mockup.tsx
//
// Pure CSS/HTML mock of a Fibidy storefront, used as the hero visual.
// No external assets, no real product photography — survives both
// Studio readiness and "we don't have a flagship merchant photo yet".
//
// Phase 2 fixes (Marketing rewrite, May 2026):
//   - "Beli sekarang" → "Order via WhatsApp" (matches WA-first
//     positioning per HANDOFF #2 §3.2)
//   - Heart/wishlist icon removed — wishlist requires an account, but
//     the mockup represents an anonymous visitor's view of a storefront.
//     Hinting at account-gated UI in the hero misrepresents the funnel.
//   - WhatsApp green tint on the CTA pill so the storefront's primary
//     CTA visually echoes the platform's distinguishing feature.
//
// When we have a polished real screenshot of /store/[slug]:
//   1. Add to public/marketing/hero-storefront.png (1600×1200, WebP/AVIF)
//   2. Replace the entire JSX below with:
//        <OptimizedImage
//          src="/marketing/hero-storefront.png"
//          alt="Fibidy storefront preview"
//          width={1600}
//          height={1200}
//          priority
//          fetchPriority="high"
//        />
//   3. Delete this file
//
// Decorative — aria-hidden — the screenreader narrative is in the
// <h1> + subheading next to it, not in the visual.
// ==========================================

import { ShoppingBag, Star, MessageCircle } from 'lucide-react';

export function StorefrontMockup() {
  return (
    <div
      aria-hidden
      className="relative overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10"
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md bg-background px-3 py-1 text-[11px] text-muted-foreground">
          tokokopi.fibidy.com
        </div>
      </div>

      {/* Storefront header */}
      <div className="flex items-center justify-between border-b px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Toko Kopi Senja
          </span>
        </div>
        <div className="hidden items-center gap-4 text-xs text-muted-foreground sm:flex">
          <span>Beranda</span>
          <span>Produk</span>
          <span>Tentang</span>
        </div>
      </div>

      {/* Hero band */}
      <div className="relative bg-gradient-to-br from-primary/12 via-background to-background px-5 py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
          Koleksi Baru
        </p>
        <h4 className="mt-1.5 text-xl font-bold tracking-tight">
          Kopi single-origin Aceh
        </h4>
        <p className="mt-1 max-w-[20rem] text-xs text-muted-foreground">
          Dari kebun keluarga di Gayo, dipanggang seminggu sekali.
        </p>
        {/* WhatsApp-tinted CTA — green echoes the WA-first positioning */}
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-medium text-white">
          <MessageCircle className="h-3 w-3" aria-hidden />
          Order via WhatsApp
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-3 gap-2.5 p-4">
        {[
          { name: 'House Blend', price: 'Rp 85.000' },
          { name: 'Gayo 250g', price: 'Rp 110.000' },
          { name: 'Cold Brew', price: 'Rp 35.000' },
        ].map((p, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border bg-background"
          >
            <div className="relative aspect-square bg-gradient-to-br from-primary/15 to-primary/5" />
            <div className="p-2">
              <p className="truncate text-[11px] font-medium">{p.name}</p>
              <div className="mt-0.5 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-primary">
                  {p.price}
                </p>
                <div className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Star className="h-2 w-2 fill-current text-amber-400" />
                  <span>4.9</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
