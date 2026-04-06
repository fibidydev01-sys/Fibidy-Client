import { tenantsApi } from '@/lib/api/tenants';
import { StoreHeader } from '@/components/layout/store/store-header';
import { StoreFooter } from '@/components/layout/store/store-footer';
import { StoreNotFound } from '@/components/layout/store/store-not-found';
import { LocalBusinessSchema } from '@/components/store/shared/local-business-schema';
import { generateThemeCSS } from '@/lib/shared/colors';
import { createTenantMetadata } from '@/lib/shared/seo';
import type { Metadata } from 'next';
import type { PublicTenant } from '@/types/tenant';

export const dynamic = 'force-dynamic';

interface StoreLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) {
    return {
      title: 'Store Not Found',
      description: 'The store you are looking for does not exist or is no longer active.',
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
  const { slug } = await params;
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