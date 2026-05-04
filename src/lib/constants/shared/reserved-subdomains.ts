// src/lib/constants/shared/reserved-subdomains.ts
//
// FE mirror of BE's src/common/constants/reserved-subdomains.ts.
// Used by:
//   - src/proxy.ts (edge — pre-routing block)
//   - Interactive Store Builder section (immediate UX feedback before API call)
//   - Register form slug input (same)
//
// MUST stay in sync with BE counterpart. When you edit one, edit both.

export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  // Infrastructure
  'www', 'api', 'cdn', 'app', 'admin', 'dashboard',
  'static', 'assets', 'images', 'files', 'uploads',
  // Auth flows
  'login', 'register', 'logout', 'auth', 'oauth',
  // Content routes
  'blog', 'help', 'support', 'docs', 'status',
  'pricing', 'about', 'contact', 'terms', 'privacy',
  // Brand-protected
  'store', 'shop', 'toko', 'fibidy',
  // Dev/test
  'test', 'demo', 'staging', 'dev',
  // Reserved keywords
  'null', 'undefined', 'root', 'system', 'mail', 'email',
]);

export function isReservedSubdomain(slug: string): boolean {
  return RESERVED_SUBDOMAINS.has(slug.toLowerCase());
}
