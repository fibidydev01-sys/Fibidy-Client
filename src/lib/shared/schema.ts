import { seoConfig } from '@/lib/constants/shared/seo.config';
import { markdownToPlainText } from './markdown';

// ==========================================
// SCHEMA.ORG JSON-LD GENERATORS
//
// [I18N MIGRATION] Phase 1 = English only.
// All fallback strings are in English.
// `availableLanguage` and `inLanguage` pull from seoConfig (single source of truth).
//
// [IDR MIGRATION — May 2026]
// Three SEO-affecting changes:
//
// 1. generateProductSchema → priceCurrency: 'IDR' (was conditional USD/USD)
//    Affects Google Search rich results / SERP price snippets.
//    Without this, Google displays "$50,000" for Rp 50.000 products.
//
// 2. generateLocalBusinessSchema → currenciesAccepted: 'IDR' (was 'USD')
//    Affects schema.org LocalBusiness markup.
//    priceRange stays '$$' (schema.org generic notation, not literal USD).
//
// 3. Removed the `(isDigital ? 'USD' : 'USD')` ternary — both branches
//    were USD anyway, classic "ternary that does nothing". Now defaults
//    to IDR consistent with the rest of the platform.
// ==========================================

// ==========================================
// INTERNAL HELPERS
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
    description: tenant.description || `${tenant.name} — Trusted online store`,
    image: tenant.heroBackgroundImage || tenant.logo || getFullUrl(seoConfig.defaultOgImage),
    logo: tenant.logo || seoConfig.organization.logo,
    telephone: tenant.phone || (tenant.whatsapp ? `+${tenant.whatsapp}` : undefined),
    email: tenant.email || undefined,
    address: tenant.address
      ? { '@type': 'PostalAddress', streetAddress: tenant.address, addressCountry: 'ID' }
      : undefined,
    // priceRange: schema.org generic notation ($-$$$$ scale, not literal USD).
    // Indonesian buyers / Google parsers understand this as "moderate price tier".
    priceRange: '$$',
    // [PANGKAS PRODUK DIGITAL] Dulu 'Credit Card, Stripe'. Platform ini
    // tidak pernah memproses pembayaran online: pesanan storefront lewat
    // WhatsApp, kasir menerima tunai/transfer/debit. Menyebut Stripe di
    // markup schema.org berarti berbohong ke Google soal cara membayar.
    paymentAccepted: 'Cash, Bank Transfer, Debit Card',
    currenciesAccepted: 'IDR',
    areaServed: { '@type': 'Country', name: 'Worldwide' },
    contactPoint: tenant.whatsapp
      ? {
        '@type': 'ContactPoint',
        telephone: `+${tenant.whatsapp}`,
        contactType: 'customer service',
        availableLanguage: seoConfig.organization.contactPoint.availableLanguage,
      }
      : undefined,
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
    kind?: 'PRODUK' | 'JASA' | null;
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

  // [IDR MIGRATION] Platform ini hanya melayani Rupiah — memengaruhi
  // tampilan rich result di SERP Google.
  const priceCurrency = 'IDR';

  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const offer = {
    '@type': 'Offer',
    url: productUrl,
    priceCurrency,
    price: product.price,
    priceValidUntil,
    availability: 'https://schema.org/InStock',
    seller: { '@type': 'Organization', name: tenant.name, url: tenantUrl },
  };

  // [KASIR JASA] Layanan dan barang butuh tipe schema.org yang berbeda.
  //
  // Menandai potong rambut sebagai Product dengan itemCondition
  // "NewCondition" bukan sekadar janggal — itu markup yang keliru, dan
  // Google memvalidasinya. Service memakai `provider`, bukan brand/
  // manufacturer, dan tidak punya kondisi barang sama sekali.
  if (product.kind === 'JASA') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${productUrl}/#service`,
      name: product.name,
      // [MARKDOWN] JSON-LD dibaca mesin pencari sebagai teks, bukan markup.
      description:
        markdownToPlainText(product.description) ||
        `${product.name} from ${tenant.name}`,
      url: productUrl,
      image: product.images?.[0] || getFullUrl(seoConfig.defaultOgImage),
      serviceType: product.category || undefined,
      provider: { '@type': 'Organization', name: tenant.name, url: tenantUrl },
      offers: offer,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}/#product`,
    name: product.name,
    // [MARKDOWN] sama seperti di atas — jalur teks-polos.
    description:
      markdownToPlainText(product.description) ||
      `${product.name} from ${tenant.name}`,
    url: productUrl,
    image: product.images?.[0] || getFullUrl(seoConfig.defaultOgImage),
    category: product.category || undefined,
    brand: { '@type': 'Brand', name: tenant.name },
    manufacturer: { '@type': 'Organization', name: tenant.name },
    offers: { ...offer, itemCondition: 'https://schema.org/NewCondition' },
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
  listName: string = 'Product List'
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
