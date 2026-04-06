import { JsonLd } from './json-ld';
import { generateBreadcrumbSchema } from '@/lib/shared/schema';
import { generateTenantBreadcrumbs, generateProductBreadcrumbs } from '@/lib/shared/seo';

// ==========================================
// BREADCRUMB SCHEMA
// Used in: All pages with breadcrumbs
// ==========================================

interface BreadcrumbSchemaProps {
  items: Array<{ name: string; url: string }>;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const schema = generateBreadcrumbSchema(items);
  return <JsonLd data={schema} />;
}

// ==========================================
// RE-EXPORT BREADCRUMB GENERATORS
// Source of truth: lib/shared/seo.ts
// ==========================================

export type { BreadcrumbItem } from '@/lib/shared/seo';
export { generateTenantBreadcrumbs, generateProductBreadcrumbs };