// ==========================================
// FEATURE FLAGS
// File: src/lib/config/features.ts
//
// Central source of truth for all FE feature flags.
//
// Module-level constants — tree-shakeable, build-time resolved.
// Reactivation in 2027 = flip env var + rebuild. Zero code change.
//
// Why module-level (not React context / hook):
//   - Constant per build → no rerenders triggered by flag changes
//   - Tree-shaker can eliminate dead branches in production bundles
//   - Server components can read it (no React-only API)
//   - SSR-safe: same value on server + client (process.env.NEXT_PUBLIC_*)
//
// Reactivation path (2027):
//   1. Backend: DIGITAL_PRODUCTS_ENABLED=true
//   2. Frontend: NEXT_PUBLIC_DIGITAL_PRODUCTS_ENABLED=true
//   3. Rebuild + redeploy. Done.
// ==========================================

export const FEATURES = {
  /**
   * Master switch for the Digital Products feature stack:
   *   - Discover marketplace (/discover/*)
   *   - Buyer Library (/dashboard/library)
   *   - Seller download history (/dashboard/products/downloads)
   *   - KYC banner + storage usage bar
   *   - Digital fields in tier comparison (rendered with Coming Soon badge)
   *
   * When `false` (current default until ~2027):
   *   - All routes above show <ComingSoonPage /> server-side
   *   - Sidebar / mobile-navbar hide their links
   *   - Hooks (useKycStatus, useStorageUsage, useDownloadHistory) skip fetching
   *   - Tier comparison shows digital features dimmed + "Coming Soon" badge
   *   - BUYER role auto-redirects to /dashboard/setup-store on login
   *
   * Backend's DigitalProductsGuard returns 503 with code FEATURE_COMING_SOON,
   * so even if FE flag is bypassed, no real damage can occur.
   */
  digitalProducts: process.env.NEXT_PUBLIC_DIGITAL_PRODUCTS_ENABLED === 'true',
} as const;
