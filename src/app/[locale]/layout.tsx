// ==========================================
// LOCALE LAYOUT — FULL HTML SHELL
// File: src/app/[locale]/layout.tsx
//
// This file holds everything that USED to live in src/app/layout.tsx:
//   - <html>, <head>, <body>
//   - Font loading (Inter)
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
// ==========================================

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
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
// FONT CONFIGURATION
// ==========================================

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

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
      <body className={`${inter.variable} font-sans antialiased`}>
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
