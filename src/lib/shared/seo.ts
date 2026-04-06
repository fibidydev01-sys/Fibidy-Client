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
    || `${tenant.name} - Belanja mudah dan pesan langsung via WhatsApp.`;

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
    keywords: [tenant.name, 'toko online', 'belanja online', 'whatsapp order', 'fibidy'],
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
    images?: string[];
    category?: string | null;
  };
  tenant: {
    name: string;
    slug: string;
  };
}): Metadata {
  const title = `${product.name} - ${tenant.name} | Fibidy`;

  const priceFormatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(product.price);

  const description = product.description
    || `Beli ${product.name} di ${tenant.name} ${priceFormatted}. Order langsung via WhatsApp!`;

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
    keywords: [product.name, tenant.name, product.category || '', 'beli online', 'whatsapp order'].filter(Boolean),
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