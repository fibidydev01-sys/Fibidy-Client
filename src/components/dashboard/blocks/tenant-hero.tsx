'use client';

import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';
import type { Tenant, PublicTenant } from '@/types/tenant';
import type { TenantLandingConfig } from '@/types/landing';

// 🔑 Import semua hero sekaligus via namespace.
// Tambah hero baru: edit index.ts saja, file ini TIDAK perlu disentuh.
import * as Heroes from './index';

interface TenantHeroProps {
  config?: TenantLandingConfig['hero'];
  tenant: Tenant | PublicTenant;
}

interface HeroComponentProps {
  title: string;
  subtitle?: string;
  description?: string;
  category?: string;
  ctaText?: string;
  ctaLink?: string;
  showCta?: boolean;
  backgroundImage?: string;
  logo?: string;
  storeName?: string;
}

// Treat the namespace as a generic record so we can lookup by string key.
const HERO_REGISTRY = Heroes as unknown as Record<
  string,
  ComponentType<HeroComponentProps> | undefined
>;

function resolveHero(block: string | undefined): ComponentType<HeroComponentProps> {
  const blockNumber = (block ?? 'hero1').replace('hero', '');
  const key = `Hero${blockNumber}`; // matches export names: Hero1, Hero2, ...
  const Component = HERO_REGISTRY[key];

  if (!Component) {
    // eslint-disable-next-line no-console
    console.warn(
      `[TenantHero] Block "${block}" → export "${key}" not found. Falling back to Hero1. ` +
      `Available: [${Object.keys(HERO_REGISTRY).join(', ')}]`,
    );
    return HERO_REGISTRY.Hero1!;
  }

  return Component;
}

export function TenantHero({ config, tenant }: TenantHeroProps) {
  const tSettings = useTranslations('settings.hero');
  const block = config?.block;
  const heroConfig = config;
  const heroConfigSettings = heroConfig?.config;

  const commonProps: HeroComponentProps = {
    title: tenant.heroTitle || heroConfig?.title || tenant.name || '',
    subtitle: tenant.heroSubtitle || heroConfig?.subtitle || tenant.description || '',
    ctaText: tenant.heroCtaText || heroConfigSettings?.ctaText || tSettings('ctaDefault'),
    ctaLink: tenant.heroCtaLink || heroConfigSettings?.ctaLink || '/products',
    backgroundImage: tenant.heroBackgroundImage || undefined,
    description: tenant.description || undefined,
    category: tenant.category || undefined,
    showCta: true,
    logo: tenant.logo || undefined,
    storeName: tenant.name,
  };

  const HeroComponent = resolveHero(block);

  return <HeroComponent {...commonProps} />;
}