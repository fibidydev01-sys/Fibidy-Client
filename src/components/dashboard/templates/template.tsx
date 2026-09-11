'use client';

// ============================================================================
// FILE: src/components/dashboard/templates/template.tsx
// PURPOSE: Template dispatcher — lazy-loads template{N}.tsx based on
//          landingConfig.hero.template
//
// [TEMPLATE MIGRATION — 2026-09-11]
//   - Folder `blocks/` → `templates/`; files `block{N}.tsx` → `template{N}.tsx`
//   - Exported components `Block{N}` → `Template{N}`
//   - Hero field consumed: `hero.template` (was `hero.block`)
//   - Identifier normalisation no longer needs the legacy `hero{n}` form —
//     the AJV regex '^template[1-9][0-9]*$' guarantees canonical input.
//
// [FIELD ORGANIZATION — 2026-05-13]
//   Template is a full landing page template with 3 sections:
//   Hero → Contact → Pre-footer CTA.
//
//   TemplateComponentProps exposes ALL editable fields (no dead field):
//     Hero:       name, category, description, logo, heroTitle, heroSubtitle,
//                 heroCtaText, heroBackgroundImage, aboutFeatures[]
//     Contact:    contactTitle, contactSubtitle, whatsapp, phone, email,
//                 address, contactMapUrl, contactShowMap, contactShowForm
//     Pre-footer: re-uses whatsapp + storeName, copy from
//                 t('store.footer.directContact.*') keys
//
//   contactShowForm is NOW wired (previously dead in template, only used in
//   /contact sub-page reference). When toggle ON, template contact section
//   renders the form.
//
//   ctaLink journey is fixed BY DESIGN — landing → Products listing is the
//   only journey for hero CTA. heroCtaLink field remains in schema for
//   future use but is not consumed at render.
//
//   [UI/UX CONSISTENCY AUDIT] ctaLink used to be the literal string
//   '/products', which only worked under subdomain routing. Now built via
//   productsUrl(tenant.slug) — same helper the store header's Products nav
//   link uses — so it also resolves correctly under path-based routing.
// ============================================================================

import { lazy, Suspense, ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import { productsUrl } from '@/lib/public/store-url';
import type { Tenant, PublicTenant, FeatureItem } from '@/types/tenant';
import type { TenantLandingConfig } from '@/types/landing';

interface TenantHeroProps {
  config?: TenantLandingConfig['hero'];
  tenant: Tenant | PublicTenant;
}

export interface TemplateComponentProps {
  // ─── Hero (CTA PRODUK → /products) ─────────────────────────
  title: string;
  subtitle?: string;
  eyebrow?: string;
  logo?: string;
  storeName: string;
  backgroundImage?: string;
  features?: FeatureItem[];      // aboutFeatures[] → banner carousel in Hero
  ctaText: string;
  ctaLink: string;               // always the tenant's Products listing — see dispatcher

  // ─── Contact (CTA KONTAK per item) ─────────────────────────
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp: string;              // ALWAYS present (validated at register)
  phone?: string;
  email: string;                 // ALWAYS present (from register)
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;     // NOW wired — drives form rendering in template

  // ─── Pre-footer CTA ────────────────────────────────────────
  // reuses whatsapp + storeName above, no new field

  // ─── Legacy (kept for backward-compat with old template1/2/3 destructures)
  description?: string;
  category?: string;
  showCta?: boolean;
}

/**
 * Extract template number from a canonical template ID.
 * Single form: "template1" → "1" → loads ./template1
 * Invalid / undefined falls back to "1".
 */
function normalizeTemplateNumber(template: string | undefined): string {
  if (!template) return '1';
  const match = template.match(/\d+$/);
  return match ? match[0] : '1';
}

export function TenantHero({ config, tenant }: TenantHeroProps) {
  const tSettings = useTranslations('settings.hero');
  const template = config?.template;
  const heroConfig = config;
  const heroConfigSettings = heroConfig?.config;

  const commonProps: TemplateComponentProps = {
    // ─── Hero ────────────────────────────────────────────────
    title:
      tenant.heroTitle ||
      heroConfig?.title ||
      tenant.name ||
      '',
    subtitle:
      tenant.heroSubtitle ||
      heroConfig?.subtitle ||
      tenant.description ||
      undefined,
    eyebrow: tenant.category || undefined,
    logo: tenant.logo || undefined,
    storeName: tenant.name,
    backgroundImage: tenant.heroBackgroundImage || undefined,
    features: tenant.aboutFeatures || [],
    ctaText:
      tenant.heroCtaText ||
      heroConfigSettings?.ctaText ||
      tSettings('ctaDefault'),
    // Was hardcoded '/products' — 404s outside subdomain routing. productsUrl() matches how the header's Products nav link is built.
    ctaLink: productsUrl(tenant.slug), // landing → /products is the only journey

    // ─── Contact ─────────────────────────────────────────────
    contactTitle: tenant.contactTitle || undefined,
    contactSubtitle: tenant.contactSubtitle || undefined,
    whatsapp: tenant.whatsapp || '',
    phone: tenant.phone || undefined,
    email: tenant.email || '',
    address: tenant.address || undefined,
    contactMapUrl: tenant.contactMapUrl || undefined,
    contactShowMap: tenant.contactShowMap ?? false,
    contactShowForm: tenant.contactShowForm ?? false,

    // ─── Legacy fields (kept for old template1/2/3 still using them) ─
    description: tenant.description || undefined,
    category: tenant.category || undefined,
    showCta: true,
  };

  const templateNumber = normalizeTemplateNumber(template);

  const TemplateComponent = lazy(() =>
    import(`./template${templateNumber}`)
      .then((mod) => ({
        default: mod[`Template${templateNumber}`] as ComponentType<TemplateComponentProps>,
      }))
      .catch(() =>
        import('./template1').then((mod) => ({
          default: mod.Template1 as ComponentType<TemplateComponentProps>,
        })),
      ),
  );

  return (
    <Suspense fallback={<TemplateSkeleton />}>
      <TemplateComponent {...commonProps} />
    </Suspense>
  );
}

function TemplateSkeleton() {
  const t = useTranslations('common.state');
  return (
    <div className="h-screen w-full animate-pulse bg-muted flex items-center justify-center">
      <div className="text-muted-foreground">{t('loading')}</div>
    </div>
  );
}