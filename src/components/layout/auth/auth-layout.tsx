import type { ReactNode } from 'react';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// ==========================================
// AUTH LAYOUT COMPONENT
// File: src/components/layout/auth/auth-layout.tsx
//
// [NATIVE MOBILE VIBES — May 2026]
// Hapus AuthLogo (nama + icon Fibidy) dari semua auth pages.
// Ganti dengan tombol back bergaya mobile native:
//   - Login / Register / Forgot → back ke "/" (root / marketing page)
//   - Teks tombol context-aware via prop `backLabel`
//   - Desain: ChevronLeft + label, tanpa border/card — native feel
//
// AuthLogo masih tersedia di auth-logo.tsx untuk dipakai di tempat lain
// (marketing header, dsb), tapi tidak lagi dipanggil dari sini.
// ==========================================

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  badge?: ReactNode;
  image?: string;
  imageAlt?: string;
  /**
   * Label tombol back. Default: "Kembali"
   * Login page: "Kembali"
   * Register page: tidak pakai layout ini (punya own page)
   */
  backLabel?: string;
  /**
   * Href tombol back. Default: "/"
   */
  backHref?: string;
  /**
   * [REGISTER 50/50]
   * When true the right column is ALWAYS rendered even when `image` is empty.
   */
  imageDynamic?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  badge,
  image,
  imageAlt = 'Auth Image',
  backLabel = 'Kembali',
  backHref = '/',
  imageDynamic = false,
}: AuthLayoutProps) {
  const showSplitLayout = !!(image || imageDynamic);

  // ==========================================
  // BACK BUTTON — mobile native style
  // ==========================================
  const BackButton = () => (
    <Link
      href={backHref}
      className="inline-flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors active:opacity-60 select-none"
    >
      <ChevronLeft className="h-5 w-5 -ml-1" strokeWidth={2.5} />
      <span>{backLabel}</span>
    </Link>
  );

  // ==========================================
  // 2 KOLOM — login / forgot-password (desktop)
  // ==========================================
  if (showSplitLayout) {
    return (
      // [UI/UX — Aug 2026] flex-1, not min-h-svh — this renders as
      // {children} inside (auth)/layout.tsx, which now owns the
      // min-h-svh budget it shares with OfflineBanner. Claiming an
      // independent min-h-svh here double-counted that height whenever
      // the banner showed. See (auth)/layout.tsx and register/page.tsx
      // for the same fix applied there.
      <div className="grid flex-1 lg:grid-cols-2">
        {/* Kolom Kiri — Form */}
        <div className="flex flex-col p-6 md:p-10">
          {/* Back button — pojok kiri atas, native feel */}
          <div className="flex justify-start">
            <BackButton />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-sm">
              {(title || badge) && (
                <div className="mb-6">
                  {badge && (
                    <div className="flex mb-2">{badge}</div>
                  )}
                  {title && (
                    <h1 className="text-2xl font-bold">{title}</h1>
                  )}
                  {description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {description}
                    </p>
                  )}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>

        {/* Kolom Kanan — Gambar */}
        <div className="relative hidden lg:block overflow-hidden">
          <div className="absolute inset-0 bg-zinc-900" />
          {image && (
            <Image
              key={image}
              src={image}
              alt={imageAlt}
              fill
              className="object-cover transition-opacity duration-500"
              priority={!imageDynamic}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </div>
    );
  }

  // ==========================================
  // CENTERED — tanpa image
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Back button — top left, native */}
      <div className="pt-2 pb-6">
        <BackButton />
      </div>

      <div className="flex flex-col items-center justify-center flex-1">
        {/* ── DESKTOP: tanpa card ── */}
        <div className="hidden lg:flex lg:flex-col lg:items-center w-full max-w-2xl">
          {(title || badge) && (
            <div className="mb-8">
              {badge && <div className="flex mb-2">{badge}</div>}
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {description && (
                <p className="text-sm text-muted-foreground mt-2">{description}</p>
              )}
            </div>
          )}
          {children}
        </div>

        {/* ── MOBILE: card wrapper ── */}
        <div className="lg:hidden w-full max-w-md">
          <div className="rounded-xl border bg-card p-8 shadow-sm">
            {(title || badge) && (
              <div className="mb-6">
                {badge && <div className="flex mb-2">{badge}</div>}
                {title && <h1 className="text-2xl font-bold">{title}</h1>}
                {description && (
                  <p className="text-sm text-muted-foreground mt-2">{description}</p>
                )}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}