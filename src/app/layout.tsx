// ==========================================
// ROOT LAYOUT — MINIMAL WRAPPER
// File: src/app/layout.tsx
//
// Next.js 16 requires a root layout.tsx even when the real HTML shell
// lives inside [locale]/layout.tsx. This file is intentionally minimal:
//
//   - NO <html> or <body> tags (those live in [locale]/layout.tsx)
//   - NO providers (those live in [locale]/layout.tsx)
//   - NO metadata (generateMetadata is per-locale in [locale]/layout.tsx)
//
// This wrapper exists SOLELY to satisfy Next.js routing requirements.
// All real layout logic has been moved into src/app/[locale]/layout.tsx.
// ==========================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}