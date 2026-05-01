'use client';

import { lazy, Suspense, useMemo, type ComponentType } from 'react';
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
 * 🚀 SMART DYNAMIC LOADING — case-sensitive safe, prod-build safe.
 *
 * Drop file `hero26.tsx` (lowercase!) yang export `Hero26` → otomatis
 * ke-pickup di runtime. Tidak perlu daftarin manual.
 *
 * Bug fixes vs versi sebelumnya:
 * 1. Fallback `./Hero1` → `./hero1` (lowercase, match nama file di disk).
 *    Bug ini sebelumnya silent di Windows (case-insensitive FS) tapi
 *    fatal di Linux/Vercel.
 * 2. `lazy()` di-cache di MODULE LEVEL, bukan di-recreate setiap render.
 *    Sebelumnya bikin unmount/remount tiap state change.
 * 3. `webpackInclude` magic comment → kasih webpack petunjuk eksplisit
 *    file mana yang harus masuk bundle. Tanpa ini, prod build bisa
 *    miss file di code-split chunks.
 * 4. Try multiple export name patterns supaya robust kalau ada file
 *    yang kebetulan export beda (default, lowercase, dst).
 */

// ── Module-level cache: lazy() dipanggil sekali per block, lalu reuse ──
const HERO_CACHE = new Map<string, ComponentType<HeroComponentProps>>();

function getHeroComponent(block: string): ComponentType<HeroComponentProps> {
  const cached = HERO_CACHE.get(block);
  if (cached) return cached;

  const blockNumber = block.replace('hero', '');

  const Component = lazy(() =>
    import(
      /* webpackInclude: /hero\d+\.tsx?$/ */
      /* webpackChunkName: "blocks/[request]" */
      `./${block}`
    )
      .then((mod) => {
        // Try common export shapes (capital is the convention, but be permissive)
        const exported =
          mod[`Hero${blockNumber}`] ??
          mod[`hero${blockNumber}`] ??
          mod.default;

        if (!exported) {
          // eslint-disable-next-line no-console
          console.error(
            `[TenantHero] No matching export in "${block}". ` +
            `Expected: Hero${blockNumber} | hero${blockNumber} | default. ` +
            `Got: [${Object.keys(mod).join(', ')}]`,
          );
          throw new Error(`No export in ${block}`);
        }

        return { default: exported as ComponentType<HeroComponentProps> };
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[TenantHero] Failed to load "${block}", falling back to hero1:`, err);
        return import(
          /* webpackChunkName: "blocks/hero1" */
          './hero1'
        ).then((m) => ({
          default: (m.Hero1 ?? m.default) as ComponentType<HeroComponentProps>,
        }));
      }),
  );

  HERO_CACHE.set(block, Component);
  return Component;
}

export function TenantHero({ config, tenant }: TenantHeroProps) {
  const tSettings = useTranslations('settings.hero');
  const block = config?.block || 'hero1';
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

  // useMemo memastikan referensi component stable per `block`,
  // selain itu cache di module level juga sudah cover.
  const HeroComponent = useMemo(() => getHeroComponent(block), [block]);

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