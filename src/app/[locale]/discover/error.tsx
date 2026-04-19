'use client';

// ==========================================
// DISCOVER ERROR BOUNDARY
// File: src/app/[locale]/discover/error.tsx
//
// [i18n FIX — 2026-04-19]
// Replaced "Try Again" button label with `useTranslations()`. Key used:
//   - discover.error.retryButton
//
// `error.message` stays passthrough — it's a runtime diagnostic string
// produced by whatever threw (network error, API validation error, etc).
// Those strings may come from our BE in English and are routed through
// `getErrorMessage()` elsewhere, but the raw `.message` here isn't
// translatable at the page level without wrapping every upstream error.
// If we want localized error strings, the place to do it is inside
// `lib/api/client.ts` at the point where server errors get parsed.
// ==========================================

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function DiscoverError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations('discover.error');

  return (
    <div className="container px-4 py-16 text-center">
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <Button onClick={reset}>{t('retryButton')}</Button>
    </div>
  );
}