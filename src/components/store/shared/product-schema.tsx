import { JsonLd } from './json-ld';
import { generateProductSchema } from '@/lib/shared/schema';

// ==========================================
// PRODUCT SCHEMA
// Used in: Product Detail Page
// ==========================================

interface ProductSchemaProps {
  product: {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    images?: string[];
    category?: string | null;
    sku?: string | null;
    stock?: number | null;
    trackStock?: boolean;
    /** [KASIR JASA] Menentukan Product vs Service di JSON-LD. */
    kind?: 'PRODUK' | 'JASA' | null;
  };
  tenant: {
    name: string;
    slug: string;
    whatsapp: string;
  };
}

export function ProductSchema({ product, tenant }: ProductSchemaProps) {
  const schema = generateProductSchema(product, tenant);
  return <JsonLd data={schema} />;
}