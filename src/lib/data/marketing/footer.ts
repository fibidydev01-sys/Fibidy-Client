// ==========================================
// FOOTER DATA
// File: src/lib/data/marketing/footer.ts
//
// v15.4 cleanup (May 2026):
//   - Legal column: added `cookies` and `copyright` links.
//     Both routes (/legal/cookies, /legal/copyright) existed in the
//     build but had ZERO links from header or footer — true orphan
//     pages. Now surfaced in the Legal column where users expect
//     to find them.
// ==========================================

export interface FooterLink {
  /** i18n key suffix under columns.{column}.links.{key} */
  key: string;
  /** Href — internal route or anchor */
  href: string;
  /** External link? Adds rel="noopener" target="_blank" */
  external?: boolean;
}

export interface FooterColumn {
  /** i18n key suffix under columns.{id}.title */
  id: 'product' | 'resources' | 'legal';
  /** Links in this column */
  links: readonly FooterLink[];
}

export const footerColumns: readonly FooterColumn[] = [
  {
    id: 'product',
    links: [
      { key: 'features', href: '#features' },
      { key: 'pricing', href: '#pricing' },
      { key: 'discover', href: '/discover' },
      { key: 'faq', href: '#faq' },
    ],
  },
  {
    id: 'resources',
    links: [
      { key: 'help', href: '/legal/faq' },
      { key: 'contact', href: '/legal/contact' },
      { key: 'fees', href: '/legal/fees' },
      { key: 'payment', href: '/legal/payment' },
    ],
  },
  {
    id: 'legal',
    links: [
      { key: 'terms', href: '/legal/terms' },
      { key: 'privacy', href: '/legal/privacy' },
      { key: 'cookies', href: '/legal/cookies' },
      { key: 'copyright', href: '/legal/copyright' },
      { key: 'refund', href: '/legal/refund' },
      { key: 'sellerAgreement', href: '/legal/seller-agreement' },
    ],
  },
] as const;