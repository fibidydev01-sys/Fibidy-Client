'use client';

// ============================================================================
// DASHBOARD ROUTE GUARD
// File: src/components/layout/dashboard/dashboard-route-guard.tsx
//
// [PHASE F · SPRINT 3 — May 2026]
// CASE E REFACTOR — EDU restriction no longer silent redirect.
//
// OLD BEHAVIOR (Phase D):
//   EDU user → /dashboard/subscription → guard redirects silently to /products
//   → user confusion ("kenapa aku ke sini?")
//
// NEW BEHAVIOR (Phase F):
//   EDU user → /dashboard/subscription → guard does NOT redirect
//   → page renders EduRestrictedPage inline with full context
//
// WHAT THIS GUARD STILL DOES:
//   Case D — !isSetupComplete → setup-store
//   Case F — setupComplete + !hasPublishedOnce → studio
//   Case E — DEFENSIVE FALLBACK only for routes not yet wired with inline page
// ============================================================================

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { usePathname, useRouter } from '@/i18n/navigation';

interface DashboardRouteGuardProps {
  children: React.ReactNode;
}

// [FIX — locale hilang] `stripLocalePrefix` DIHAPUS dari file ini.
//
// Helper itu dulu perlu karena `usePathname` diambil dari 'next/navigation',
// yang mengembalikan path apa adanya termasuk prefix: '/id/dashboard/studio'.
// Sekarang `usePathname` datang dari '@/i18n/navigation' (next-intl), dan itu
// SUDAH mengembalikan path tanpa locale — '/dashboard/studio' baik di /en
// maupun /id. Helper-nya jadi tidak pernah mengubah apa pun.
//
// Dibuang, bukan dibiarkan: fungsi bernama stripLocalePrefix yang tidak
// benar-benar menangani locale adalah tempat pertama orang akan mencari
// ketika ada bug path berikutnya — dan mereka akan mencari di tempat yang salah.

function isSetupStorePath(pathname: string): boolean {
  return pathname === '/dashboard/setup-store';
}

function isStudioPath(pathname: string): boolean {
  return pathname.startsWith('/dashboard/studio');
}

// Routes with INLINE EduRestrictedPage handling — guard does NOT redirect these
const EDU_INLINE_HANDLED_PATHS = ['/dashboard/subscription'] as const;

function isEduInlineHandled(pathname: string): boolean {
  const clean = pathname;
  return EDU_INLINE_HANDLED_PATHS.some((p) => clean.startsWith(p));
}

function isEduRestrictedPath(pathname: string): boolean {
  const clean = pathname;
  return clean.startsWith('/dashboard/subscription');
}

function shouldHide(
  tenant: {
    isSetupComplete?: boolean;
    isEduMode?: boolean;
    hasPublishedOnce?: boolean;
  } | null,
  pathname: string,
): boolean {
  if (!tenant) return false;

  // Case E — only hide if route NOT yet wired with inline handler
  if (
    tenant.isEduMode === true &&
    isEduRestrictedPath(pathname) &&
    !isEduInlineHandled(pathname)
  ) {
    return true;
  }

  // Case F — setupComplete + !hasPublishedOnce → must publish first
  if (
    tenant.isSetupComplete === true &&
    tenant.hasPublishedOnce === false &&
    !isStudioPath(pathname)
  ) {
    return true;
  }

  // Case D — setup not complete
  if (
    !tenant.isSetupComplete &&
    !isSetupStorePath(pathname) &&
    !isStudioPath(pathname)
  ) {
    return true;
  }

  return false;
}

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);

  useEffect(() => {
    if (!tenant) return;

    // [SPRINT 3] Case E — DEFENSIVE FALLBACK
    // Only redirect paths NOT yet wired with inline EduRestrictedPage
    if (
      tenant.isEduMode === true &&
      isEduRestrictedPath(pathname) &&
      !isEduInlineHandled(pathname)
    ) {
      router.replace('/dashboard/products');
      return;
    }

    // Case F — setupComplete + !hasPublishedOnce → back to /studio
    if (
      tenant.isSetupComplete === true &&
      tenant.hasPublishedOnce === false &&
      !isStudioPath(pathname)
    ) {
      router.replace('/dashboard/studio');
      return;
    }

    // Case D — isSetupComplete=false
    if (
      !tenant.isSetupComplete &&
      !isSetupStorePath(pathname) &&
      !isStudioPath(pathname)
    ) {
      router.replace('/dashboard/setup-store');
      return;
    }
  }, [tenant, pathname, router]);

  if (shouldHide(tenant, pathname)) {
    return null;
  }

  return <>{children}</>;
}
