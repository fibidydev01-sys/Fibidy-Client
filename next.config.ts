// ==========================================
// NEXT.JS CONFIG — WRAPPED WITH next-intl PLUGIN
//
// [Updated: May 2026]
//
// BE runs at api.fibidy.com (same-site as FE on fibidy.com / www.fibidy.com).
// No rewrite/proxy needed — cookie sharing works natively via Domain=.fibidy.com
// and SameSite=Lax. FE calls api.fibidy.com directly with credentials: 'include'.
//
// CHANGES FROM PREVIOUS CONFIG:
//   1. No rewrite/proxy needed — same-site setup via Domain=.fibidy.com
//   2. Added R2 remote patterns (*.r2.cloudflarestorage.com, *.r2.dev)
//   3. Updated Referrer-Policy to strict-origin-when-cross-origin
//
// UNCHANGED:
//   - next-intl plugin (createNextIntlPlugin)
//   - turbopack config
//   - images config (all remotePatterns + formats + sizes)
//   - experimental.optimizePackageImports
//   - headers() (security, caching, sitemap, manifest, sw.js, favicon)
//   - reactStrictMode, poweredByHeader, trailingSlash, compress
// ==========================================

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Point the plugin at our request config file.
// Common locations:
//   - ./src/i18n/request.ts  (App Router default)
//   - ./i18n.ts              (legacy)
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // ==========================================
  // TURBOPACK CONFIG (Next.js 16+ default)
  // ==========================================
  turbopack: {},

  // ==========================================
  // IMAGES CONFIGURATION
  // ==========================================
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      // Cloudflare R2 — public-bucket URLs for digital product assets
      // Note: signed download URLs don't go through next/image (direct download)
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24,
  },

  // ==========================================
  // EXPERIMENTAL FEATURES
  // ==========================================
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "date-fns",
    ],
  },

  // ==========================================
  // HEADERS
  // ==========================================
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/sitemap-0.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },

  // ==========================================
  // REDIRECTS
  // ==========================================
  async redirects() {
    return [];
  },

  // ==========================================
  // NO REWRITES / NO PROXY
  //
  // BE is at api.fibidy.com (same-site as FE). FE calls it directly
  // via NEXT_PUBLIC_API_URL=https://api.fibidy.com/api. Cookies travel
  // natively because:
  //   - Cookie Domain=.fibidy.com (set by BE via shared cookie constants)
  //   - SameSite=Lax allows same-site cross-origin requests
  //   - fetch() uses credentials: 'include' (set in lib/api/client.ts)
  //
  // If you ever switch BE to a non-fibidy.com host (e.g., raw Railway URL),
  // uncomment the rewrites() block below to proxy requests through the FE.
  // ==========================================
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "https://YOUR-BE-HOST/api/:path*",
  //     },
  //   ];
  // },

  // ==========================================
  // OTHER SETTINGS
  // ==========================================
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  compress: true,
};

export default withNextIntl(nextConfig);