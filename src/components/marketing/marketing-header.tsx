"use client";

// ==========================================
// MARKETING HEADER (MINIMAL)
// File: src/components/marketing/marketing-header.tsx
//
// [MINIMAL MODE — May 2026]
// Header reduced to:
//   - Logo (left, links to /)
//   - Sign in (ghost) + Open your store (primary) — desktop AND mobile
//
// REMOVED in minimal mode:
//   - Desktop NavigationMenu (Product / Resources / Solutions / Enterprise / Pricing mega-menus)
//   - Mobile Sheet/burger with accordion nav
//   - All NavItem / MegaMenuItem / MobileNavItem helpers
//   - SoonBadge helper
//
// All of the above are preserved verbatim in git history. To restore
// the full mega-menu header, revert this file to v15.x or pull the
// previous version from the v15.3 collection.
//
// Why no burger on mobile in minimal mode:
//   The two CTAs fit comfortably on mobile (Sign in is text-only,
//   Open your store is the primary button). Adding a burger for
//   "no menu items" would feel like dead chrome — better to expose
//   both actions inline.
//
// i18n keys still consumed:
//   - marketing.header.ctaSignIn   → "Sign in" / "Masuk"
//   - marketing.header.ctaPrimary  → "Open your store" / "Buka Toko Gratis"
//
// All other marketing.header.* keys (nav.*, menuOpen, menuClose) are
// kept in the JSON files but not consumed here — they'll be picked
// back up the moment the full header returns.
// ==========================================

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { AuthLogo } from "@/components/layout/auth/auth-logo";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  const t = useTranslations("marketing.header");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Left: Logo ── */}
        <Link href="/" className="flex items-center" aria-label="Fibidy home">
          <AuthLogo size="sm" />
        </Link>

        {/* ── Right: CTAs (visible on every viewport) ── */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("ctaSignIn")}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">{t("ctaPrimary")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}