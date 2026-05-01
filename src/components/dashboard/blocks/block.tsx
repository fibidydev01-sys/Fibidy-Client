'use client';

import { lazy, Suspense, ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import type { Tenant, PublicTenant } from '@/types/tenant';
import type { TenantLandingConfig } from '@/types/landing';

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

/**
 * 🚀 SMART DYNAMIC LOADING - AUTO-DISCOVERY ENABLED!
 * NO MANUAL IMPORTS! Just add hero201.tsx and it works!
 *
 * 🎯 DATA SOURCE:
 * Priority: tenant fields > landingConfig > defaults (dari i18n)
 */
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

  // 🚀 SMART: Dynamic component loading
  const blockNumber = block?.replace('hero', '');
  const HeroComponent = lazy(() =>
    import(`./hero${blockNumber}`)
      .then((mod) => ({ default: mod[`Hero${blockNumber}`] as ComponentType<HeroComponentProps> }))
      .catch(() =>
        import('./Hero1').then((mod) => ({
          default: mod.Hero1 as ComponentType<HeroComponentProps>,
        }))
      )
  );

  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HeroComponent {...commonProps} />
    </Suspense>
  );
}

function HeroSkeleton() {
  const t = useTranslations('common.state');
  return (
    <div className="h-screen w-full animate-pulse bg-muted flex items-center justify-center">
      <div className="text-muted-foreground">{t('loading')}</div>
    </div>
  );
}