// ==========================================
// ROUTE GUARD — BUYER ROLE RESTRICTION
//
// BUYER is not allowed to access seller-only routes.
// Used in dashboard layout or middleware.
//
// [I18N MIGRATION] Locale-aware: strips leading /xx locale
// prefix before comparing against SELLER_ONLY_ROUTES so that
// `/id/dashboard/products` is matched the same as `/dashboard/products`.
// Phase 1 uses `localePrefix: 'as-needed'` so this is preemptive —
// but it costs nothing and future-proofs for Phase 2+.
// ==========================================

export const SELLER_ONLY_ROUTES = [
  '/dashboard/products',
  '/dashboard/studio',
  '/dashboard/settings',
] as const;

/**
 * Strip a leading 2-letter locale prefix from pathname.
 * `/en/dashboard/products` → `/dashboard/products`
 * `/dashboard/products`    → `/dashboard/products` (unchanged)
 * `/en`                    → `/`
 */
function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

/**
 * Check whether pathname is a route only SELLER role may access.
 */
export function isBuyerRestrictedRoute(pathname: string): boolean {
  const normalized = stripLocalePrefix(pathname);
  return SELLER_ONLY_ROUTES.some((route) => normalized.startsWith(route));
}