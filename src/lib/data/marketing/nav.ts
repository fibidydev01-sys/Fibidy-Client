// ==========================================
// MARKETING NAV DATA
// File: src/lib/data/marketing/nav.ts
//
// Header nav links. All hrefs are anchor scrolls to in-page sections
// (Lenis handles smooth scrolling). When we expand to multi-page
// marketing (HANDOFF §10.3), these will become real routes.
//
// Labels live in messages/{en,id}/marketing.json under
// `marketing.header.nav.*` — the `labelKey` field here is just the
// path Claude/dev points the component at.
// ==========================================

export interface NavLink {
  /** i18n key under marketing.header.nav.* */
  labelKey: string;
  /** Href — anchor (#section) or path (/foo) */
  href: string;
}

export const headerNav: readonly NavLink[] = [
  { labelKey: 'features', href: '#features' },
  { labelKey: 'pricing', href: '#pricing' },
  { labelKey: 'faq', href: '#faq' },
] as const;
