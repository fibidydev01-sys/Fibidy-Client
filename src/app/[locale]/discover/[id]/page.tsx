import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { discoverApi } from '@/lib/api/discover';
import { DiscoverDetailClient } from './client';
import type { PublicProduct } from '@/types/product';

// ==========================================
// DISCOVER DETAIL PAGE
// File: src/app/[locale]/discover/[id]/page.tsx
//
// [TIDUR-NYENYAK LINT FIX]
// JSX construction inside try/catch is an anti-pattern because
// React renders are deferred — errors thrown during render won't
// be caught by the try/catch (they belong to an error boundary).
//
// Pattern: fetch in try/catch (await resolves synchronously for
// the try/catch), return JSX outside.
//
// [i18n FIX — 2026-04-19]
// Three changes in `generateMetadata`:
//
//   1. The `title` field now reads `product.name` directly (no i18n needed —
//      it's dynamic user content), but the "Product Not Found" fallback
//      when the fetch fails is sourced from `discover.metadata.detailNotFound`.
//
//   2. The `description` fallback — used when a product has no description
//      of its own — is now `discover.metadata.detailFallbackDescription`
//      which interpolates `{name}` via next-intl's placeholder syntax.
//      Actual product descriptions still win when present (they are
//      user-authored content and not translated).
//
//   3. The metadata function is now async-and-locale-aware, awaiting
//      `getTranslations` once after `params`.
//
// The runtime page render (default export) passes through unchanged —
// all the UI copy lives inside DiscoverDetailClient (see file 07 in
// this bucket).
// ==========================================

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'discover.metadata' });

  try {
    const product = await discoverApi.getById(id);
    return {
      title: product.name,
      description:
        product.description ??
        t('detailFallbackDescription', { name: product.name }),
    };
  } catch {
    return { title: t('detailNotFound') };
  }
}

async function fetchProduct(id: string): Promise<PublicProduct | null> {
  try {
    return await discoverApi.getById(id);
  } catch {
    return null;
  }
}

export default async function DiscoverDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    notFound();
  }

  // [LINT FIX] JSX is now outside try/catch — any render-time errors
  // bubble up to Next.js error boundary as intended.
  return <DiscoverDetailClient product={product} />;
}