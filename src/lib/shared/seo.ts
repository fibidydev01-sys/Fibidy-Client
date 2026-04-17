import { Metadata } from 'next';
import { seoConfig } from '@/lib/constants/shared/seo.config';

// ==========================================
// URL UTILITIES
// ==========================================

export function getFullUrl(path: string = ''): string {
  return seoConfig.getMainUrl(path);
}

function getTenantUrl(slug: string, path: string = ''): string {
  return seoConfig.getTenantUrl(slug, path);
}

// ==========================================
// TEXT UTILITIES (internal)
// ==========================================

function truncateDescription(text: string, maxLength: number = 155): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + '...';
}

function sanitizeMetaText(text: string): string {
  if (!text) return '';
  return text.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
}

// ==========================================
// METADATA GENERATORS
// ==========================================

export function createTenantMetadata({
  tenant,
  pageTitle,
  pageDescription,
  path = '',
  ogImage,
}: {
  tenant: {
    name: string;
    slug: string;
    description?: string | null;
    logo?: string | null;
    heroBackgroundImage?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  };
  pageTitle?: string;
  pageDescription?: string;
  path?: string;
  ogImage?: string;
}): Metadata {
  const title = pageTitle
    ? `${pageTitle} | ${tenant.name}`
    : tenant.metaTitle || `${tenant.name} | Fibidy`;

  const description = pageDescription
    || tenant.metaDescription
    || tenant.description
    || `${tenant.name} - Shop online and order directly.`;

  const canonicalUrl = getTenantUrl(tenant.slug, path);
  const imageUrl = ogImage || tenant.heroBackgroundImage || tenant.logo;

  const metadataBase = seoConfig.isProduction
    ? new URL(`https://${tenant.slug}.${seoConfig.domain}`)
    : new URL(seoConfig.siteUrl);

  return {
    metadataBase,
    title,
    description: truncateDescription(sanitizeMetaText(description)),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: truncateDescription(description),
      url: canonicalUrl,
      siteName: tenant.name,
      locale: seoConfig.locale,
      type: 'website',
      images: imageUrl ? [
        {
          url: imageUrl.startsWith('http') ? imageUrl : getFullUrl(imageUrl),
          width: 1200,
          height: 630,
          alt: tenant.name,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateDescription(description),
      images: imageUrl ? [imageUrl.startsWith('http') ? imageUrl : getFullUrl(imageUrl)] : undefined,
    },
    keywords: [tenant.name, 'online store', 'shop online', 'digital products', 'fibidy'],
  };
}

export function createProductMetadata({
  product,
  tenant,
}: {
  product: {
    id: string;
    name: string;
    slug?: string | null;
    description?: string | null;
    price: number;
    currency?: string | null;
    images?: string[];
    category?: string | null;
    fileKey?: string | null;
  };
  tenant: {
    name: string;
    slug: string;
  };
}): Metadata {
  const title = `${product.name} - ${tenant.name} | Fibidy`;

  // Resolve currency from product:
  // - Digital (fileKey != null) → USD
  // - Custom/service → product.currency or fallback USD
  const isDigital = !!product.fileKey;
  const currency = product.currency ?? (isDigital ? 'USD' : 'USD');

  const priceFormatted = new Intl.NumberFormat(
    currency === 'USD' ? 'en-US' : 'id-ID',
    {
      style: 'currency',
      currency,
      minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }
  ).format(product.price);

  const description = product.description
    || `Buy ${product.name} at ${tenant.name} for ${priceFormatted}.`;

  const productPath = product.slug ? `/p/${product.slug}` : `/product/${product.id}`;
  const canonicalUrl = getTenantUrl(tenant.slug, productPath);
  const ogImage = product.images?.[0];

  const metadataBase = seoConfig.isProduction
    ? new URL(`https://${tenant.slug}.${seoConfig.domain}`)
    : new URL(seoConfig.siteUrl);

  return {
    metadataBase,
    title,
    description: truncateDescription(sanitizeMetaText(description)),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: truncateDescription(description),
      url: canonicalUrl,
      siteName: tenant.name,
      locale: seoConfig.locale,
      type: 'website',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: truncateDescription(description),
      images: ogImage ? [ogImage] : undefined,
    },
    keywords: [product.name, tenant.name, product.category || '', 'buy online', 'digital download'].filter(Boolean),
  };
}

// ==========================================
// BREADCRUMB HELPERS
// ==========================================

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateTenantBreadcrumbs(tenant: {
  name: string;
  slug: string;
}): BreadcrumbItem[] {
  return [
    { name: 'Home', url: getFullUrl('/') },
    { name: tenant.name, url: getTenantUrl(tenant.slug) },
  ];
}

export function generateProductBreadcrumbs(
  tenant: { name: string; slug: string },
  product: { name: string; id: string; slug?: string | null; category?: string | null }
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: getFullUrl('/') },
    { name: tenant.name, url: getTenantUrl(tenant.slug) },
  ];

  if (product.category) {
    breadcrumbs.push({
      name: product.category,
      url: getTenantUrl(tenant.slug, `/products?category=${encodeURIComponent(product.category)}`),
    });
  }

  const productPath = product.slug ? `/p/${product.slug}` : `/product/${product.id}`;
  breadcrumbs.push({ name: product.name, url: getTenantUrl(tenant.slug, productPath) });

  return breadcrumbs;
}
