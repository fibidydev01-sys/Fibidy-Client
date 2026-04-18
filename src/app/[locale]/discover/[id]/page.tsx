import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { discoverApi } from '@/lib/api/discover';
import { DiscoverDetailClient } from './client';
import type { PublicProduct } from '@/types/product';

// ==========================================
// DISCOVER DETAIL PAGE
//
// [TIDUR-NYENYAK LINT FIX]
// JSX construction inside try/catch is an anti-pattern because
// React renders are deferred — errors thrown during render won't
// be caught by the try/catch (they belong to an error boundary).
//
// Pattern: fetch in try/catch (await resolves synchronously for
// the try/catch), return JSX outside.
// ==========================================

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await discoverApi.getById(id);
    return {
      title: product.name,
      description: product.description ?? `Buy ${product.name} on Fibidy`,
    };
  } catch {
    return { title: 'Product Not Found' };
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
