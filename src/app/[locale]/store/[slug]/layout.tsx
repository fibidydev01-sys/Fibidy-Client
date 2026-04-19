import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { tenantsApi } from '@/lib/api/tenants';
import { StoreHeader } from '@/components/layout/store/store-header';
import { StoreFooter } from '@/components/layout/store/store-footer';
import { StoreNotFound } from '@/components/layout/store/store-not-found';
import { LocalBusinessSchema } from '@/components/store/shared/local-business-schema';
import { generateThemeCSS } from '@/lib/shared/colors';
import { createTenantMetadata } from '@/lib/shared/seo';
import type { PublicTenant } from '@/types/tenant';

// ==========================================
// STORE LAYOUT
// File: src/app/[locale]/store/[slug]/layout.tsx
//
// [i18n FIX — 2026-04-19]
// The fallback metadata (shown when the tenant isn't found / slug 404s)
// now pulls its copy from `store.metadata.notFoundTitle` and
// `store.metadata.notFoundDescription` via `getTranslations`, so the
// 404 page tab title respects the current locale.
//
// The happy-path `createTenantMetadata()` call is untouched — that helper
// already composes title/description from tenant-authored fields
// (`tenant.metaTitle`, `tenant.metaDescription`), which are user content
// and shouldn't be translated by the platform.
//
// `robots: { index: false, follow: false }` on the 404 fallback stays
// hardcoded — robots directives are protocol-level, not user-facing.
// ==========================================

export const dynamic = 'force-dynamic';

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}

async function getTenant(slug: string): Promise<PublicTenant | null> {
  try {
    const tenant = await tenantsApi.getBySlug(slug);
    return tenant;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) {
    const t = await getTranslations({ locale, namespace: 'store.metadata' });
    return {
      title: t('notFoundTitle'),
      description: t('notFoundDescription'),
      robots: { index: false, follow: false },
    };
  }

  return createTenantMetadata({
    tenant: {
      name: tenant.name,
      slug: tenant.slug,
      description: tenant.description,
      logo: tenant.logo,
      heroBackgroundImage: tenant.heroBackgroundImage,
      metaTitle: tenant.metaTitle,
      metaDescription: tenant.metaDescription,
    },
  });
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const { locale, slug } = await params;

  // Enable static rendering for this locale (next-intl best practice)
  setRequestLocale(locale);

  const tenant = await getTenant(slug);

  if (!tenant || tenant.status !== 'ACTIVE') {
    return <StoreNotFound slug={slug} />;
  }

  const primaryHex = tenant.theme?.primaryColor || '';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(primaryHex) }} />

      <div className="tenant-theme flex min-h-screen flex-col">
        <LocalBusinessSchema
          tenant={{
            name: tenant.name,
            slug: tenant.slug,
            description: tenant.description,
            category: tenant.category,
            whatsapp: tenant.whatsapp || '',
            phone: tenant.phone,
            address: tenant.address,
            logo: tenant.logo,
            heroBackgroundImage: tenant.heroBackgroundImage,
            socialLinks: tenant.socialLinks,
          }}
        />

        <StoreHeader tenant={tenant} />

        <main className="flex-1">
          {children}
        </main>

        <StoreFooter tenant={tenant} />
      </div>
    </>
  );
}