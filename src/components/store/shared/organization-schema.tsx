import { MultiJsonLd } from './json-ld';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
} from '@/lib/shared/schema';

// ==========================================
// ORGANIZATION + WEBSITE SCHEMA
// Used in: Root Layout (src/app/layout.tsx)
// ==========================================

export function OrganizationSchema() {
  const schemas = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
  ];

  return <MultiJsonLd data={schemas} />;
}