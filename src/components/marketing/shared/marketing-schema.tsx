// ==========================================
// MARKETING SCHEMA (JSON-LD)
// File: src/components/marketing/shared/marketing-schema.tsx
//
// Server component that renders FAQPage + SoftwareApplication JSON-LD
// in the marketing layout. Reads:
//   - FAQ data from lib/data/marketing/faq.ts (ids only)
//   - FAQ copy from messages/{locale}/marketing.json (q + a per id)
//   - Pricing data from lib/data/marketing/pricing.ts (numeric tiers)
//   - Pricing copy from messages/{locale}/dashboard.json (tier names)  ← Phase 4 Q19
//   - SoftwareApp meta from messages/{locale}/marketing.json
//     (seo.softwareApp.name, .description, .category)
//
// [PHASE 4 — May 2026]
// 1. Per-locale `inLanguage` flows through to both schemas. The locale
//    prop has been the source of truth all along; we just stopped
//    discarding it before reaching the generators.
//
// 2. Tier names sourced from `dashboard.subscription.plans.{tier}.name`
//    (Q19 SoT mirror), NOT from the now-removed `marketing.pricing.plans.*`
//    namespace. Same source as the visual pricing-card render — drift-free.
//
// 3. pricingTiers now has 3 entries (FREE, STARTER, BUSINESS) per Q18,
//    so the offers array carries 3 Offer nodes. Google rich-result
//    pricing cards on SERP get the full ladder.
//
// Pulled together here (not in marketing-footer or marketing layout)
// so the schema can be conditionally swapped or removed without
// touching the visual chrome.
//
// Reuses the existing MultiJsonLd primitive at
// components/store/shared/json-ld.tsx — same pattern OrganizationSchema
// uses, so output stays consistent with the existing root-layout
// schema that ships on every page.
// ==========================================

import { getTranslations } from 'next-intl/server';
import { MultiJsonLd } from '@/components/store/shared/json-ld';
import { faqItems } from '@/lib/data/marketing/faq';
import { pricingTiers } from '@/lib/data/marketing/pricing';
import {
  generateFaqPageSchema,
  generateSoftwareApplicationSchema,
} from '@/lib/shared/marketing-schema';

// Numeric prices — MUST match the i18n display strings in
// dashboard.subscription.plans.{tier}.price. If you change one, change
// the other; otherwise SERP price snippets and visible price drift.
//
// Phase 4: 3-tier active. All entries are emitted as Offer nodes.
const TIER_PRICE_IDR: Record<string, number> = {
  FREE: 0,
  STARTER: 35000,
  BUSINESS: 149000,
};

interface MarketingSchemaProps {
  locale: string;
}

export async function MarketingSchema({ locale }: MarketingSchemaProps) {
  const tFaq = await getTranslations({
    locale,
    namespace: 'marketing.faq.items',
  });
  // [PHASE 4 Q19] Tier names come from dashboard subscription i18n —
  // single source of truth shared with the marketing pricing-section
  // and the dashboard subscription page.
  const tPlans = await getTranslations({
    locale,
    namespace: 'dashboard.subscription.plans',
  });
  const tSeo = await getTranslations({
    locale,
    namespace: 'marketing.seo.softwareApp',
  });

  // FAQ
  const faqQas = faqItems.map((item) => ({
    q: tFaq(`${item.id}.q`),
    a: tFaq(`${item.id}.a`),
  }));

  // SoftwareApplication offers — one per tier in pricingTiers.
  const offers = pricingTiers.map((tier) => ({
    name: tPlans(`${tier.id}.name`),
    price: TIER_PRICE_IDR[tier.id] ?? 0,
    billingPeriod: tier.id === 'FREE' ? null : ('P1M' as const),
  }));

  const schemas = [
    generateFaqPageSchema(faqQas, locale),
    generateSoftwareApplicationSchema(
      {
        name: tSeo('name'),
        description: tSeo('description'),
        category: tSeo('category'),
        offers,
      },
      locale,
    ),
  ];

  return <MultiJsonLd data={schemas} />;
}
