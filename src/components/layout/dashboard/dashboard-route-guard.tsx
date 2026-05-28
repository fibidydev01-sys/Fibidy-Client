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
//   Case D — SELLER + !isSetupComplete → setup-store
//   Case F — SELLER + setupComplete + !hasPublishedOnce → studio
//   Case A — BUYER + !FEATURES.digitalProducts → setup-store
//   Case B — BUYER on seller-only route → library
//   Case E — DEFENSIVE FALLBACK only for routes not yet wired with inline page
// ============================================================================

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { isBuyerRestrictedRoute } from '@/lib/constants/shared/route-guard';
import { FEATURES } from '@/lib/config/features';

interface DashboardRouteGuardProps {
  children: React.ReactNode;
}

function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

function isSetupStorePath(pathname: string): boolean {
  return stripLocalePrefix(pathname) === '/dashboard/setup-store';
}

function isStudioPath(pathname: string): boolean {
  return stripLocalePrefix(pathname).startsWith('/dashboard/studio');
}

// Routes with INLINE EduRestrictedPage handling — guard does NOT redirect these
const EDU_INLINE_HANDLED_PATHS = [
  '/dashboard/subscription',
  '/dashboard/onboard',
] as const;

function isEduInlineHandled(pathname: string): boolean {
  const clean = stripLocalePrefix(pathname);
  return EDU_INLINE_HANDLED_PATHS.some((p) => clean.startsWith(p));
}

function isEduRestrictedPath(pathname: string): boolean {
  const clean = stripLocalePrefix(pathname);
  return (
    clean.startsWith('/dashboard/subscription') ||
    clean.startsWith('/dashboard/onboard')
  );
}

function shouldHide(
  tenant: {
    role: string;
    isSetupComplete?: boolean;
    isEduMode?: boolean;
    hasPublishedOnce?: boolean;
  } | null,
  pathname: string,
): boolean {
  if (!tenant) return false;

  // Case E — only hide if route NOT yet wired with inline handler
  if (
    tenant.role === 'SELLER' &&
    tenant.isEduMode === true &&
    isEduRestrictedPath(pathname) &&
    !isEduInlineHandled(pathname)
  ) {
    return true;
  }

  // Case F — SELLER + setupComplete + !hasPublishedOnce → must publish first
  if (
    tenant.role === 'SELLER' &&
    tenant.isSetupComplete === true &&
    tenant.hasPublishedOnce === false &&
    !isStudioPath(pathname)
  ) {
    return true;
  }

  // Case D — SELLER setup not complete
  if (
    tenant.role === 'SELLER' &&
    !tenant.isSetupComplete &&
    !isSetupStorePath(pathname) &&
    !isStudioPath(pathname)
  ) {
    return true;
  }

  // Case A — Digital OFF + BUYER
  if (!FEATURES.digitalProducts && tenant.role === 'BUYER') {
    return !isSetupStorePath(pathname);
  }

  // Case B — Digital ON + BUYER on seller-only route
  if (tenant.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
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
      tenant.role === 'SELLER' &&
      tenant.isEduMode === true &&
      isEduRestrictedPath(pathname) &&
      !isEduInlineHandled(pathname)
    ) {
      router.replace('/dashboard/products');
      return;
    }

    // Case F — SELLER + setupComplete + !hasPublishedOnce → back to /studio
    if (
      tenant.role === 'SELLER' &&
      tenant.isSetupComplete === true &&
      tenant.hasPublishedOnce === false &&
      !isStudioPath(pathname)
    ) {
      router.replace('/dashboard/studio');
      return;
    }

    // Case D — SELLER + isSetupComplete=false
    if (
      tenant.role === 'SELLER' &&
      !tenant.isSetupComplete &&
      !isSetupStorePath(pathname) &&
      !isStudioPath(pathname)
    ) {
      router.replace('/dashboard/setup-store');
      return;
    }

    // Case A
    if (!FEATURES.digitalProducts && tenant.role === 'BUYER') {
      if (!isSetupStorePath(pathname)) {
        router.replace('/dashboard/setup-store');
      }
      return;
    }

    // Case B
    if (tenant.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
      router.replace('/dashboard/library');
      return;
    }
  }, [tenant, pathname, router]);

  if (shouldHide(tenant, pathname)) {
    return null;
  }

  return <>{children}</>;
}
