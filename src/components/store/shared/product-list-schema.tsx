import { JsonLd } from './json-ld';
import { generateProductListSchema } from '@/lib/shared/schema';

// ==========================================
// PRODUCT LIST SCHEMA (ItemList)
// Used in: Products listing page
// ==========================================

interface ProductListSchemaProps {
  products: Array<{
    id: string;
    name: string;
    slug?: string | null;
    price: number;
    images?: string[];
  }>;
  tenant: {
    name: string;
    slug: string;
  };
  listName?: string;
}

export function ProductListSchema({
  products,
  tenant,
  listName,
}: ProductListSchemaProps) {
  // Only generate if there are products
  if (!products || products.length === 0) {
    return null;
  }

  const schema = generateProductListSchema(
    products,
    tenant,
    listName || `Produk ${tenant.name}`
  );

  return <JsonLd data={schema} />;
}