'use client';

// ============================================================================
// FILE: src/components/dashboard/blocks/block.tsx
// PURPOSE: Block dispatcher — lazy-loads block{N}.tsx based on landingConfig
//
// [BLOCK MIGRATION — 2026-05-13]
//   - Renamed lazy-import target from `./hero{N}` to `./block{N}`
//   - Added value normalizer to extract block number from EITHER:
//       "block1" (new format)        → "1" → loads ./block1
//       "hero1"  (legacy format)     → "1" → loads ./block1
//       undefined / invalid          → "1" → loads ./block1 (fallback)
//
// [FIELD ORGANIZATION — 2026-05-13]
//   Block is a full landing page template with 3 sections:
//   Hero → Contact → Pre-footer CTA.
//
//   BlockComponentProps exposes ALL editable fields (no dead field):
//     Hero:       name, category, description, logo, heroTitle, heroSubtitle,
//                 heroCtaText, heroBackgroundImage, aboutFeatures[]
//     Contact:    contactTitle, contactSubtitle, whatsapp, phone, email,
//                 address, contactMapUrl, contactShowMap, contactShowForm
//     Pre-footer: re-uses whatsapp + storeName, copy from
//                 t('store.footer.directContact.*') keys
//
//   contactShowForm is NOW wired (previously dead in block, only used in
//   /contact sub-page reference). When toggle ON, block contact section
//   renders the form.
//
//   ctaLink hardcoded `/products` BY DESIGN — landing → /products is the
//   only journey for hero CTA. heroCtaLink field remains in schema for
//   future use but is not consumed at render.
// ============================================================================

import { lazy, Suspense, ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import type { Tenant, PublicTenant, FeatureItem } from '@/types/tenant';
import type { TenantLandingConfig } from '@/types/landing';

interface TenantHeroProps {
  config?: TenantLandingConfig['hero'];
  tenant: Tenant | PublicTenant;
}

export interface BlockComponentProps {
  // ─── Hero (CTA PRODUK → /products) ─────────────────────────
  title: string;
  subtitle?: string;
  eyebrow?: string;
  logo?: string;
  storeName: string;
  backgroundImage?: string;
  features?: FeatureItem[];      // aboutFeatures[] → banner carousel in Hero
  ctaText: string;
  ctaLink: string;               // hardcoded '/products' in dispatcher

  // ─── Contact (CTA KONTAK per item) ─────────────────────────
  contactTitle?: string;
  contactSubtitle?: string;
  whatsapp: string;              // ALWAYS present (validated at register)
  phone?: string;
  email: string;                 // ALWAYS present (from register)
  address?: string;
  contactMapUrl?: string;
  contactShowMap?: boolean;
  contactShowForm?: boolean;     // NOW wired — drives form rendering in block

  // ─── Pre-footer CTA ────────────────────────────────────────
  // reuses whatsapp + storeName above, no new field

  // ─── Legacy (kept for backward-compat with old block1/2/3 destructures)
  description?: string;
  category?: string;
  showCta?: boolean;
}

/**
 * Extract block number from a block ID string.
 * Accepts both new ("block1") and legacy ("hero1") formats.
 */
function normalizeBlockNumber(block: string | undefined): string {
  if (!block) return '1';
  const match = block.match(/\d+$/);
  return match ? match[0] : '1';
}

export function TenantHero({ config, tenant }: TenantHeroProps) {
  const tSettings = useTranslations('settings.hero');
  const block = config?.block;
  const heroConfig = config;
  const heroConfigSettings = heroConfig?.config;

  const commonProps: BlockComponentProps = {
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
    ctaLink: '/products', // hardcoded — landing → /products is the only journey

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

    // ─── Legacy fields (kept for old block1/2/3 still using them) ─
    description: tenant.description || undefined,
    category: tenant.category || undefined,
    showCta: true,
  };

  const blockNumber = normalizeBlockNumber(block);

  const BlockComponent = lazy(() =>
    import(`./block${blockNumber}`)
      .then((mod) => ({
        default: mod[`Block${blockNumber}`] as ComponentType<BlockComponentProps>,
      }))
      .catch(() =>
        import('./block1').then((mod) => ({
          default: mod.Block1 as ComponentType<BlockComponentProps>,
        })),
      ),
  );

  return (
    <Suspense fallback={<BlockSkeleton />}>
      <BlockComponent {...commonProps} />
    </Suspense>
  );
}

function BlockSkeleton() {
  const t = useTranslations('common.state');
  return (
    <div className="h-screen w-full animate-pulse bg-muted flex items-center justify-center">
      <div className="text-muted-foreground">{t('loading')}</div>
    </div>
  );
}
