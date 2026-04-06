import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { tenantsApi } from '@/lib/api/tenants';
import { TenantAbout } from '@/components/store/about/tenant-about';

interface AboutPageProps {
  params: Promise<{ slug: string }>;
}

async function getTenant(slug: string) {
  try {
    return await tenantsApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) return { title: 'Not Found' };
  return { title: `About Us | ${tenant.name}` };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) notFound();

  return <TenantAbout features={tenant!.aboutFeatures || []} />;
}