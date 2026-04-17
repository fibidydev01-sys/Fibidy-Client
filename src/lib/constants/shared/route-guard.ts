// ==========================================
// ROUTE GUARD — BUYER ROLE RESTRICTION
//
// BUYER tidak boleh akses route seller.
// Digunakan di dashboard layout atau middleware.
// ==========================================

export const SELLER_ONLY_ROUTES = [
  '/dashboard/products',
  '/dashboard/studio',
  '/dashboard/settings',
] as const;

/**
 * Check apakah pathname adalah route yang hanya boleh diakses SELLER.
 */
export function isBuyerRestrictedRoute(pathname: string): boolean {
  return SELLER_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}