'use client';

// ==========================================
// DISCOVER DETAIL NOT FOUND
// File: src/app/[locale]/discover/[id]/not-found.tsx
//
// [i18n FIX — 2026-04-19]
// Replaced all hardcoded EN strings with `useTranslations()` lookups.
// Keys used:
//   - discover.notFound.title
//   - discover.notFound.description
//   - discover.notFound.backButton
//
// The file is marked `'use client'` so `useTranslations()` hook works.
// Next.js supports both server and client `not-found.tsx`, but the
// original file didn't render on the server either (uses <Link> only),
// so there's no SSR/hydration regression from this change.
// ==========================================

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function DiscoverNotFound() {
  const t = useTranslations('discover.notFound');

  return (
    <div className="container px-4 py-16 text-center">
      <h1 className="text-2xl font-bold mb-2">{t('title')}</h1>
      <p className="text-muted-foreground mb-6">{t('description')}</p>
      <Button asChild>
        <Link href="/discover">{t('backButton')}</Link>
      </Button>
    </div>
  );
}