// ==========================================
// LOCALE LAYOUT — FULL HTML SHELL
// File: src/app/[locale]/layout.tsx
//
// This file holds everything that USED to live in src/app/layout.tsx:
//   - <html>, <head>, <body>
//   - Font loading (Geist + Geist Mono — via official `geist` package, v15.3.3)
//   - Root metadata + viewport
//   - Preconnect / DNS-prefetch
//   - Apple / MS PWA meta tags
//   - OrganizationSchema (JSON-LD)
//   - Providers (QueryClient + Theme)
//   - Toaster + PwaInstallPrompt
//
// i18n integration:
//   - params: Promise<{ locale }> (Next 16 async params)
//   - setRequestLocale(locale) for static rendering
//   - <html lang={locale}>
//   - NextIntlClientProvider wraps Providers
//   - generateStaticParams() for locale pre-generation
//
// [PHASE 4 — May 2026]
// 1. Hreflang fixed for the homepage canonical:
//      en  → /
//      id  → /id
//      x-default → /
//    The previous `{ [locale]: '/' }` was wrong because it advertised
//    the CURRENT locale's slug as the only alternate (e.g. on /id it
//    said "id is at /" — which is the EN homepage, not the ID one).
//
//    Note: this is the LAYOUT-level default. Inner pages with their
//    own metadata (e.g. /about) should override their alternates if
//    they expose locale-specific paths. For the homepage (the most
//    important SEO target), this default is correct.
//
// 2. Robots gating: `index: process.env.VERCEL_ENV === 'production'`.
//    Prevents Vercel preview deployments (`*.vercel.app`) from being
//    indexed by Google. Without this gate, every preview deploy could
//    theoretically rank for "fibidy" branded queries — duplicate
//    content + brand dilution.
//
// [PHASE 5 polish v15.3.3 — May 2026]
// Geist now loaded via the OFFICIAL `geist` npm package (the same
// package Vercel themselves use on vercel.com), replacing the
// previous `next/font/google` jalur from v15.3.0–v15.3.2.
//
// Why the swap:
//   - `next/font/google` pulls a Google-redistributed copy of Geist.
//     That copy is a subset — kerning pairs, font-feature-settings,
//     and the full opsz axis can be trimmed depending on what Google
//     hosts at any given moment.
//   - The official `geist` package self-hosts the canonical .woff2
//     files via `next/font/local` under the hood. Files are
//     maintained by Vercel + Basement Studio (the original designers),
//     updated in lockstep with the GitHub releases of vercel/geist-font,
//     and ship with the full glyph set + feature settings intact.
//   - Zero Google CDN dependency at runtime.
//
// What changed:
//   - Imports: { Geist, Geist_Mono } from 'next/font/google'
//             → { GeistSans } from 'geist/font/sans'
//             + { GeistMono } from 'geist/font/mono'
//   - No more Geist({ subsets, display, variable }) calls — the
//     official package bakes those settings in (subset = 'latin',
//     display = 'swap', variable = '--font-geist-sans' / '--font-geist-mono').
//
// What did NOT change:
//   - CSS variable names: still --font-geist-sans / --font-geist-mono.
//     globals.css and every consumer that references them keeps
//     working without touching a single line of CSS.
//   - The `.variable` className contract — applied to <body> below
//     in the same place as before.
// ==========================================

import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Providers } from '@/lib/providers/root-provider';
import { Toaster } from '@/components/ui/sonner';
import { seoConfig } from '@/lib/constants/shared/seo.config';
import { getFullUrl } from '@/lib/shared/seo';
import { OrganizationSchema } from '@/components/store/shared/organization-schema';
import { PwaInstallPrompt } from '@/components/dashboard/shared/pwa-install-prompt';
import { routing } from '@/i18n/routing';
import '../globals.css';

// ==========================================
// FONT CONFIGURATION — Geist + Geist Mono (v15.3.3)
// ==========================================
//
// `GeistSans` and `GeistMono` are pre-configured Font objects exported
// by the `geist` npm package. They are NOT factory functions — they
// already carry the CSS variable wiring (`--font-geist-sans` /
// `--font-geist-mono`) baked in by Vercel.
//
// Use them directly via `.variable` on a wrapping element. The
// `.variable` value is a CSS class containing the `--font-*`
// custom-property declaration; everything inside that element
// inherits the variable through the cascade.
//
// No instantiation, no options object. The package itself is the
// source of truth for subsetting, display strategy, weight axis
// coverage, and font-feature-settings.
// ==========================================

// (Intentionally no `Geist()` / `Geist_Mono()` calls here — the
// official package exports the configured Font objects directly.)

// ==========================================
// VIEWPORT CONFIGURATION
// ==========================================

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: seoConfig.themeColor },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

// ==========================================
// STATIC PARAMS — pre-generate all supported locales
// ==========================================

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// ==========================================
// METADATA (locale-aware wrapper around existing seoConfig)
// ==========================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // We only use `locale` in error checks today; kept here for future
  // per-locale SEO field expansion (e.g. swapping defaultTitle by locale).
  await params;

  // [PHASE 4] Robots gating — production-only indexing.
  // VERCEL_ENV is automatically set by Vercel: 'production' | 'preview' | 'development'.
  // When undefined (e.g. local dev or non-Vercel host), defaults to noindex.
  const shouldIndex = process.env.VERCEL_ENV === 'production';

  return {
    title: {
      default: seoConfig.defaultTitle,
      template: seoConfig.titleTemplate,
    },
    description: seoConfig.defaultDescription,
    keywords: [...seoConfig.defaultKeywords],
    applicationName: seoConfig.siteName,
    authors: [{ name: seoConfig.siteName, url: seoConfig.siteUrl }],
    creator: seoConfig.siteName,
    publisher: seoConfig.siteName,
    generator: 'Next.js',
    metadataBase: new URL(seoConfig.siteUrl),
    alternates: {
      canonical: '/',
      // [PHASE 4] Per-locale hreflang. EN (default) at /, ID at /id, plus
      // x-default fallback. Inner pages override their own when they
      // expose locale-specific URLs.
      languages: {
        en: '/',
        id: '/id',
        'x-default': '/',
      },
    },
    robots: {
      // [PHASE 4] Preview deployments → noindex; production → index.
      index: shouldIndex,
      follow: true,
      nocache: false,
      googleBot: {
        index: shouldIndex,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
      shortcut: '/favicon.ico',
    },
    manifest: '/manifest.json',
    openGraph: {
      type: 'website',
      locale: seoConfig.locale,
      url: seoConfig.siteUrl,
      siteName: seoConfig.siteName,
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      images: [
        {
          url: getFullUrl(seoConfig.defaultOgImage),
          width: 1200,
          height: 630,
          alt: seoConfig.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.defaultTitle,
      description: seoConfig.defaultDescription,
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      images: [getFullUrl(seoConfig.defaultOgImage)],
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: seoConfig.siteName,
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    category: 'technology',
  };
}

// ==========================================
// LOCALE LAYOUT
// ==========================================

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Guard against unsupported locales in the URL
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Preconnect to API (production) */}
        {seoConfig.isProduction && (
          <>
            <link rel="preconnect" href="https://api.fibidy.com" />
            <link rel="dns-prefetch" href="https://api.fibidy.com" />
          </>
        )}

        {/* PWA Theme Color (fallback) */}
        <meta name="theme-color" content="#ec4899" />

        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Fibidy" />

        {/* MS Tile */}
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Organization + WebSite Schema (JSON-LD) */}
        <OrganizationSchema />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider>
          <Providers>
            {children}
            <Toaster position="top-center" richColors />
            <PwaInstallPrompt />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}