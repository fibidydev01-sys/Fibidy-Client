// ==========================================
// ROOT LOCALE PAGE
// File: src/app/[locale]/page.tsx
//
// [i18n FIX — 2026-04-19]
// Previously used `redirect` from 'next/navigation' directly, which is
// NOT locale-aware. When a user lands on `/id/`, the redirect would
// produce `/dashboard/products` (root path) and next-intl's middleware
// would have to re-resolve the locale on the next hop — inefficient and
// sometimes loses the locale entirely on browsers that don't carry the
// Accept-Language header as expected.
//
// Fix: use the `redirect` wrapper from `@/i18n/navigation`, which
// automatically prefixes the destination with the current locale. So
// `/id/` → `/id/dashboard/products` and `/en/` → `/dashboard/products`
// (since `en` is the defaultLocale with `localePrefix: 'as-needed'`).
//
// The rest of the auth-cookie check logic is unchanged.
// ==========================================

import { cookies } from 'next/headers';
import { redirect } from '@/i18n/navigation';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('fibidy_auth');

  if (token) {
    redirect({ href: '/dashboard/products', locale });
  } else {
    redirect({ href: '/login', locale });
  }
}