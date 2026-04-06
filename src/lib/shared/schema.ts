import { seoConfig } from '@/lib/constants/shared/seo.config';

// ==========================================
// INTERNAL HELPERS
// Tidak diimport dari luar — resolve langsung via seoConfig
// ==========================================

function getFullUrl(path: string = ''): string {
  return seoConfig.getMainUrl(path);
}

function getTenantUrl(slug: string, path: string = ''): string {
  return seoConfig.getTenantUrl(slug, path);
}

// ==========================================
// SCHEMA GENERATORS
// ==========================================

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${seoConfig.siteUrl}/#organization`,
    name: seoConfig.organization.name,
    legalName: seoConfig.organization.legalName,
    url: seoConfig.organization.url,
    logo: {
      '@type': 'ImageObject',
      url: seoConfig.organization.logo,
      width: 512,
      height: 512,
    },
    foundingDate: seoConfig.organization.foundingDate,
    address: {
      '@type': 'PostalAddress',
      addressCountry: seoConfig.organization.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: seoConfig.organization.contactPoint.contactType,
      availableLanguage: seoConfig.organization.contactPoint.availableLanguage,
    },
    sameAs: seoConfig.organization.sameAs,
  };
}

export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${seoConfig.siteUrl}/#website`,
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    publisher: {
      '@id': `${seoConfig.siteUrl}/#organization`,
    },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${seoConfig.siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    ],
    inLanguage: seoConfig.language,
  };
}

export function generateLocalBusinessSchema(tenant: {
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
    youtube?: string;
    twitter?: string;
    threads?: string;
    whatsapp?: string;
    telegram?: string;
    pinterest?: string;
    behance?: string;
    dribbble?: string;
    vimeo?: string;
    linkedin?: string;
  } | null;
}) {
  const tenantUrl = getTenantUrl(tenant.slug);
  const sameAs: string[] = Object.values(tenant.socialLinks ?? {}).filter(Boolean) as string[];

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${tenantUrl}/#business`,
    name: tenant.name,
    url: tenantUrl,
    description: tenant.description || `${tenant.name} - Toko online terpercaya`,
    image: tenant.heroBackgroundImage || tenant.logo || getFullUrl(seoConfig.defaultOgImage),
    logo: tenant.logo || seoConfig.organization.logo,
    telephone: tenant.phone || `+${tenant.whatsapp}`,
    email: tenant.email || undefined,
    address: tenant.address
      ? { '@type': 'PostalAddress', streetAddress: tenant.address, addressCountry: 'ID' }
      : undefined,
    priceRange: '$$',
    paymentAccepted: 'Cash, Bank Transfer, E-Wallet',
    currenciesAccepted: 'IDR',
    areaServed: { '@type': 'Country', name: 'Indonesia' },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${tenant.whatsapp}`,
      contactType: 'customer service',
      availableLanguage: ['Indonesian'],
    },
    sameAs: sameAs.length > 0 ? sameAs : undefined,
  };
}

export function generateProductSchema(
  product: {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    price: number;
    comparePrice?: number | null;
    images?: string[];
    category?: string | null;
  },
  tenant: {
    name: string;
    slug: string;
    whatsapp: string;
  }
) {
  const productPath = product.slug ? `/p/${product.slug}` : `/product/${product.id}`;
  const productUrl = getTenantUrl(tenant.slug, productPath);
  const tenantUrl = getTenantUrl(tenant.slug);

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}/#product`,
    name: product.name,
    description: product.description || `${product.name} dari ${tenant.name}`,
    url: productUrl,
    image: product.images?.[0] || getFullUrl(seoConfig.defaultOgImage),
    category: product.category || undefined,
    brand: { '@type': 'Brand', name: tenant.name },
    manufacturer: { '@type': 'Organization', name: tenant.name },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'IDR',
      price: product.price,
      priceValidUntil,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: tenant.name, url: tenantUrl },
    },
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const validItems = items.filter(
    (item) =>
      item &&
      typeof item.name === 'string' &&
      typeof item.url === 'string' &&
      item.url.length > 0
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: validItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : getFullUrl(item.url),
    })),
  };
}

export function generateProductListSchema(
  products: Array<{
    id: string;
    name: string;
    slug?: string | null;
    price: number;
    images?: string[];
  }>,
  tenant: { name: string; slug: string },
  listName: string = 'Daftar Produk'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => {
      const productPath = product.slug ? `/p/${product.slug}` : `/product/${product.id}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: getTenantUrl(tenant.slug, productPath),
        name: product.name,
        image: product.images?.[0] || undefined,
      };
    }),
  };
}

