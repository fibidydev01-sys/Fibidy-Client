"use client";

// ============================================================================
// COOKIE CONSENT — Modal persetujuan cookie
// File: src/components/shared/cookie-consent.tsx
//
// [MODAL CENTER — STYLE PWA IOS — Sep 2026]
// Tiru style IosModal di pwa-install-prompt.tsx:
//   - Backdrop gelap + backdrop-blur-sm
//   - Card modal di tengah (fixed inset-0 flex items-center justify-center)
//   - rounded-2xl + shadow-2xl
//   - Scale-in animation (zoom-in-95 + fade-in)
//   - Delay 600ms sebelum muncul
//
// Muncul di SEMUA halaman (di-render di [locale]/layout.tsx).
// z-[1000] — di bawah navbar (z-[1100]) tapi backdrop nutup semua.
// ============================================================================

import * as React from "react";
import { Cookie } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/shared/utils";

// ── Konstanta ──────────────────────────────────────────────────────────────
const COOKIE_NAME = "fibidy-cookie-consent";
const COOKIE_VALUE = "accepted";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 tahun

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
  // mounted guard — supaya tidak render di server
  const [mounted, setMounted] = React.useState(false);
  // visible = modal sedang ditampilkan (opacity 100, scale 100)
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (!hasConsentCookie()) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const handleAccept = () => {
    setConsentCookie();
    setVisible(false);
  };

  // Belum mounted → tidak render (hindari hydration mismatch)
  if (!mounted) return null;

  return (
    <>
      {/* Backdrop — full screen, gelap + blur */}
      <div
        onClick={handleAccept}
        className={cn(
          "fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm",
          "transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden="true"
      />

      {/* Wrapper modal — center */}
      <div
        className={cn(
          "fixed inset-0 z-[1001] flex items-center justify-center p-4",
          "transition-opacity duration-300",
          visible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Card modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          className={cn(
            // Card style — rounded-2xl + border + shadow-2xl
            "relative w-full max-w-md rounded-2xl border border-border bg-background",
            "shadow-2xl",
            "p-6 md:p-8",
            // Scale-in animation
            "transition-all duration-300 ease-out",
            visible ? "scale-100" : "scale-95",
          )}
        >
          {/* Icon bulat primary — konsisten PWA iOS */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-md">
              <Cookie className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2
                id="cookie-consent-title"
                className="text-base font-semibold text-foreground leading-tight"
              >
                Kami pakai cookie
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Persetujuan singkat sebelum lanjut
              </p>
            </div>
          </div>

          {/* Body text */}
          <p
            id="cookie-consent-desc"
            className="text-sm text-muted-foreground leading-relaxed mb-6 text-justify"
          >
            Fibidy pakai cookie untuk mengingat preferensi, menjaga sesi login,
            dan meningkatkan pengalamanmu saat menjelajah toko online. Dengan
            klik <strong className="text-ink font-semibold">Terima</strong>,
            kamu setuju dengan{" "}
            <Link
              href="/legal/cookies"
              className="text-link hover:underline font-medium"
            >
              Kebijakan Cookie
            </Link>{" "}
            kami. Kamu bisa berubah pikiran kapan saja dengan hapus cookie di
            browser.
          </p>

          {/* Actions — 2 tombol rounded-full, konsisten PWA */}
          <div className="flex gap-2">
            <Link
              href="/legal/cookies"
              className="flex-1 h-10 rounded-full border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center"
            >
              Pelajari
            </Link>
            <button
              type="button"
              onClick={handleAccept}
              className="flex-1 h-10 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              Terima
            </button>
          </div>
        </div>
      </div>
    </>
  );
}