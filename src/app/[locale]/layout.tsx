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
// NEW for i18n:
//   - params: Promise<{ locale }> (Next 16 async params)
//   - setRequestLocale(locale) for static rendering
//   - <html lang={locale}>
//   - NextIntlClientProvider wraps Providers
//   - generateStaticParams() for locale pre-generation
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
//
// Phase 1: single locale ('en') — everything resolves to current seoConfig values.
// Phase 2: swap string constants for per-locale t('seo.*') lookups here.
// ==========================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

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
      languages: {
        // Phase 1: only 'en' is active. Keep key mirrored from locale for future-proofing.
        [locale]: '/',
      },
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
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