'use client';

// ==========================================
// STORE PRODUCT NOT FOUND PAGE
// File: src/app/[locale]/store/[slug]/products/[id]/not-found.tsx
//
// [i18n FIX — 2026-04-19]
// All hardcoded EN strings replaced with `useTranslations()` lookups.
// JSON keys used:
//   - store.product.notFound.title
//   - store.product.notFound.description
//   - store.product.notFound.backToStore
//
// Converted to `'use client'` to use the hook. The original page used
// `<Link href="..">` (which resolves at render, not during SSR walk),
// so there's no server-side functionality lost by moving the tree to
// the client boundary. Next.js supports both server and client
// `not-found.tsx` files.
// ==========================================

import Link from 'next/link';
import { Package, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function ProductNotFound() {
  const t = useTranslations('store.product.notFound');

  return (
    <div className="container px-4 py-16">
      <div className="text-center max-w-md mx-auto">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-muted p-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>

        <p className="text-muted-foreground mb-6">{t('description')}</p>

        <Button asChild>
          <Link href="..">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToStore')}
          </Link>
        </Button>
      </div>
    </div>
  );
}