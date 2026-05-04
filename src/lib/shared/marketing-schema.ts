// ==========================================
// MARKETING JSON-LD SCHEMA GENERATORS
// File: src/lib/shared/marketing-schema.ts
//
// Two generators specifically for the marketing landing page:
//
//   generateFaqPageSchema(items, locale)
//     → schema.org FAQPage. Each entry is a Question/Answer pair.
//       Powers Google rich-result FAQ accordions in SERP and is
//       cited by AI agents (Google generative results, Perplexity,
//       ChatGPT) when summarizing what Fibidy is.
//
//   generateSoftwareApplicationSchema(input, locale)
//     → schema.org SoftwareApplication, type Webapp / SaaS.
//       Declares Fibidy itself as a software product so search
//       engines can categorize the homepage correctly. Includes
//       offers (free/starter/business) so price snippets render
//       in IDR, not USD.
//
// We DON'T generate Product schema — that's for individual e-com
// product detail pages (already handled by store/product schemas
// in lib/shared/schema.ts), not for the SaaS landing.
//
// All copy passed in as already-translated strings — generators are
// pure functions, locale-agnostic.
//
// [PHASE 4 — May 2026]
// Both generators now accept a `locale` argument and emit the
// schema.org `inLanguage` property. Values:
//   - 'en' → 'en-US'
//   - 'id' → 'id-ID'
//
// Without this, Google Search Console couldn't disambiguate the EN
// vs. ID FAQ rich-result entries — they shared @id slugs but had
// different copy. inLanguage lets crawlers map each entry to the
// correct hreflang counterpart.
//
// inLanguage is applied at three levels per FAQPage:
//   1. The FAQPage root
//   2. Each Question
//   3. Each acceptedAnswer
// Each level reinforces the locale signal — Google docs recommend the
// belt-and-braces approach for FAQ rich results in multilingual sites.
//
// [PRICING SOURCE]
// Prices are imported from lib/data/marketing/pricing.ts to stay in
// sync with both the marketing page and (indirectly) the subscription
// page. If the platform fee changes, update pricing.ts → both
// marketing card AND JSON-LD reflect it automatically.
// ==========================================

import { seoConfig } from '@/lib/constants/shared/seo.config';

// ==========================================
// LOCALE → BCP-47 TAG
// ==========================================

/**
 * Normalize a locale slug ('en' | 'id') to a BCP-47 language tag
 * ('en-US' | 'id-ID') for use in schema.org `inLanguage`.
 *
 * Defaults to 'en-US' for any unrecognized locale to avoid emitting
 * a malformed tag.
 */
function localeToBcp47(locale: string): string {
  return locale === 'id' ? 'id-ID' : 'en-US';
}

// ==========================================
// FAQ PAGE SCHEMA
// ==========================================

export interface FaqQa {
  q: string;
  a: string;
}

export function generateFaqPageSchema(
  items: readonly FaqQa[],
  locale: string,
) {
  const inLanguage = localeToBcp47(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${seoConfig.siteUrl}/#faq`,
    inLanguage,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      inLanguage,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
        inLanguage,
      },
    })),
  };
}

// ==========================================
// SOFTWARE APPLICATION SCHEMA
// ==========================================
//
// Fibidy itself as a SaaS product. Offer list reflects the three
// tiers from lib/data/marketing/pricing.ts. Prices are passed in
// already-formatted (component-level decision: marketing copy
// drives the visible label, not the raw number).
// ==========================================

export interface SoftwareAppOffer {
  /** Tier name (translated) — e.g. "Free", "Starter" */
  name: string;
  /** Price in IDR (numeric) — 0 for free */
  price: number;
  /** Recurrence — usually 'P1M' (monthly) or null for one-time/free */
  billingPeriod: 'P1M' | null;
}

export interface SoftwareAppSchemaInput {
  /** App name from i18n */
  name: string;
  /** Short description from i18n */
  description: string;
  /** Category — e.g. 'BusinessApplication' */
  category: string;
  /** Offer list, ordered cheapest first */
  offers: readonly SoftwareAppOffer[];
}

export function generateSoftwareApplicationSchema(
  input: SoftwareAppSchemaInput,
  locale: string,
) {
  const inLanguage = localeToBcp47(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${seoConfig.siteUrl}/#softwareapp`,
    inLanguage,
    name: input.name,
    description: input.description,
    applicationCategory: input.category,
    operatingSystem: 'Web',
    url: seoConfig.siteUrl,
    publisher: {
      '@id': `${seoConfig.siteUrl}/#organization`,
    },
    // AggregateOffer when there are multiple price points
    offers: input.offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: 'IDR',
      availability: 'https://schema.org/InStock',
      ...(offer.billingPeriod && {
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: offer.price,
          priceCurrency: 'IDR',
          billingDuration: offer.billingPeriod,
          unitText: 'MONTH',
        },
      }),
    })),
  };
}
