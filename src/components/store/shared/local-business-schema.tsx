import { JsonLd } from './json-ld';
import { generateLocalBusinessSchema } from '@/lib/shared/schema';

// ==========================================
// LOCAL BUSINESS SCHEMA
// Used in: Tenant Store Layout
// ==========================================

interface LocalBusinessSchemaProps {
  tenant: {
    name: string;
    slug: string;
    description?: string | null;
    category?: string;
    whatsapp: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    logo?: string | null;
    heroBackgroundImage?: string | null;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      tiktok?: string;
    } | null;
  };
}

export function LocalBusinessSchema({ tenant }: LocalBusinessSchemaProps) {
  const schema = generateLocalBusinessSchema(tenant);
  return <JsonLd data={schema} />;
}