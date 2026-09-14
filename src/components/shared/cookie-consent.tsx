"use client";

// ============================================================================
// COOKIE CONSENT — Banner persetujuan cookie
// File: src/components/shared/cookie-consent.tsx
//
// [MVP — KISS — Sep 2026]
// Simpel: 1 tombol "Terima", link ke /legal/cookies, cookie 1 tahun.
// Muncul di SEMUA halaman (di-render di [locale]/layout.tsx).
//
// Behavior:
//   - Cek cookie 'fibidy-cookie-consent' saat mount.
//   - Kalau ada → tidak render apa-apa.
//   - Kalau belum → render card di bottom-right dengan slide-in animation.
//   - Klik "Terima" → set cookie (1 tahun) + slide-out animation + unmount.
//
// Style: konsisten dengan design system pill — rounded-2xl + border +
// shadow bento. Icon Cookie dari lucide.
// ============================================================================

import * as React from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/shared/utils";

// ── Konstanta ──────────────────────────────────────────────────────────────
const COOKIE_NAME = "fibidy-cookie-consent";
const COOKIE_VALUE = "accepted";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

// ── Shadow signature — konsisten bento card ────────────────────────────────
const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.05),0_12px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]";

// ── Helper: cek apakah consent cookie sudah ada ────────────────────────────
function hasConsentCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${COOKIE_NAME}=${COOKIE_VALUE}`));
}

// ── Helper: set consent cookie ─────────────────────────────────────────────
function setConsentCookie() {
  document.cookie = `${COOKIE_NAME}=${COOKIE_VALUE}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function CookieConsent() {
  // mounted guard — supaya tidak render di server (cookie cuma ada di client)
  const [mounted, setMounted] = React.useState(false);
  // visible = banner sedang ditampilkan
  const [visible, setVisible] = React.useState(false);
  // animating out — untuk handle slide-down sebelum unmount
  const [animatingOut, setAnimatingOut] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Cek cookie setelah mount
    if (!hasConsentCookie()) {
      // Delay sedikit supaya tidak "pop" di first paint
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    setConsentCookie();
    setAnimatingOut(true);
    // Tunggu animasi slide-down selesai, baru unmount
    setTimeout(() => {
      setVisible(false);
      setAnimatingOut(false);
    }, 300);
  };

  const handleDismiss = () => {
    // X button = sama seperti terima (KISS: tidak ada partial consent)
    handleAccept();
  };

  // Belum mounted → tidak render (hindari hydration mismatch)
  if (!mounted) return null;
  // Sudah di-dismiss / belum waktunya muncul → tidak render
  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Persetujuan cookie"
      className={cn(
        // Posisi: fixed bottom-right
        "fixed bottom-4 right-4 z-[1400] max-w-sm w-[calc(100vw-2rem)] sm:w-[380px]",
        // Card style — rounded-2xl + border + shadow bento
        "rounded-2xl border border-border bg-background p-5",
        CARD_SHADOW,
        // Animasi slide-in dari bawah
        "transition-all duration-300 ease-out",
        animatingOut
          ? "translate-y-4 opacity-0"
          : "translate-y-0 opacity-100 animate-in fade-in-0 slide-in-from-bottom-4"
      )}
    >
      {/* Close button (X) di pojok kanan atas */}
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-ink transition-colors"
        aria-label="Tutup"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Icon bulat + header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted flex-shrink-0">
          <Cookie className="w-4 h-4 text-ink" strokeWidth={1.75} />
        </div>
        <p className="text-sm font-semibold text-ink">
          Kami pakai cookie
        </p>
      </div>

      {/* Body */}
      <p className="text-xs text-muted-foreground leading-relaxed mb-4 text-justify">
        Fibidy pakai cookie untuk mengingat preferensi dan meningkatkan pengalamanmu.
        Dengan klik <strong className="text-ink">Terima</strong>, kamu setuju dengan{" "}
        <Link
          href="/legal/cookies"
          className="text-link hover:underline font-medium"
        >
          Kebijakan Cookie
        </Link>{" "}
        kami.
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleAccept}
          size="sm"
          className="flex-1 rounded-full"
        >
          Terima
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="flex-1 rounded-full"
        >
          <Link href="/legal/cookies">Pelajari</Link>
        </Button>
      </div>
    </div>
  );
}