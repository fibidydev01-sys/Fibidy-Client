import { notFound } from 'next/navigation';
import { tenantsApi } from '@/lib/api/tenants';
import { TenantContact } from '@/components/store/contact/tenant-contact';

interface ContactPageProps {
  params: Promise<{ slug: string }>;
}

async function getTenant(slug: string) {
  try {
    return await tenantsApi.getBySlug(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ContactPageProps) {
  const { slug } = await params;
  const tenant = await getTenant(slug);
  if (!tenant) return { title: 'Not Found' };
  return { title: `Contact | ${tenant.name}` };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { slug } = await params;
  const tenant = await getTenant(slug);

  if (!tenant) notFound();

  return <TenantContact tenant={tenant!} />;
}