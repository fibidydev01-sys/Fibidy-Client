import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { tenantsApi } from '@/lib/api/tenants';
import { StoreHeader } from '@/components/layout/store/store-header';
import { StoreFooter } from '@/components/layout/store/store-footer';
import { StoreNotFound } from '@/components/layout/store/store-not-found';
import { EduBanner } from '@/components/store/shared/edu-banner';
import { LocalBusinessSchema } from '@/components/store/shared/local-business-schema';
import { generateThemeCSS } from '@/lib/shared/colors';
import { createTenantMetadata } from '@/lib/shared/seo';
import type { PublicTenant } from '@/types/tenant';

// ============================================================================
// STORE LAYOUT
// File: src/app/[locale]/store/[slug]/layout.tsx
//
// [PHASE D — May 2026]
// Render EduBanner SEBELUM StoreHeader jika tenant.isEduMode === true.
// EduBanner bersifat sticky + non-dismissible.
// tenant.isEduMode tersedia karena findBySlug() di BE sudah include isEduMode.
// ============================================================================

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
    },
  });
}

export default async function StoreLayout({
  children,
  params,
}: StoreLayoutProps) {
  const { locale, slug } = await params;

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

        {/* [PHASE D] EduBanner — sticky, non-dismissible, above StoreHeader */}
        {tenant.isEduMode === true && <EduBanner />}

        <StoreHeader tenant={tenant} />

        <main className="flex-1">
          {children}
        </main>

        <StoreFooter tenant={tenant} />
      </div>
    </>
  );
}
