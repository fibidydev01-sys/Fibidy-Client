// ==========================================
// FOOTER DATA
// File: src/lib/data/marketing/footer.ts
//
// Footer column structure. Each column has a title key + link list.
// Copy at `marketing.footer.columns.{column}.title` and
// `marketing.footer.columns.{column}.links.{key}` in marketing.json.
//
// Locale switcher + theme toggle live in the bottom-bar (rendered
// directly by MarketingFooter, not data-driven). They're component
// concerns, not content concerns.
//
// Social icons use siteConfig.links — already the source of truth
// across the codebase. No need to duplicate URLs here.
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
      { key: 'refund', href: '/legal/refund' },
      { key: 'sellerAgreement', href: '/legal/seller-agreement' },
    ],
  },
] as const;
