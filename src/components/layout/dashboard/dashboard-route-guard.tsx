'use client';

// ==========================================
// DASHBOARD ROUTE GUARD
// File: src/components/layout/dashboard/dashboard-route-guard.tsx
//
// Handles client-side role-based + feature-flag-based redirects.
//
// [PHASE 3] Logic now flag-aware:
//
// Case A — Digital OFF + BUYER:
//   BUYER has practically zero useful destinations. Redirect everything
//   to /dashboard/setup-store so they can upgrade to seller.
//
// Case B — Digital ON + BUYER on seller-only route:
//   Existing behavior. Redirect to /dashboard/library (their main hub).
//
// Case C — Digital OFF + SELLER on a digital route:
//   No redirect. The page itself renders <ComingSoonPage /> server-side.
//   Avoids redirect flash + lets user see what's happening.
//
// Note: navigating to /dashboard/library directly with digital off will
// hit Case C for SELLER (shows ComingSoonPage) or Case A for BUYER
// (redirects to setup-store).
// ==========================================

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { isBuyerRestrictedRoute } from '@/lib/constants/shared/route-guard';
import { FEATURES } from '@/lib/config/features';

interface DashboardRouteGuardProps {
  children: React.ReactNode;
}

/**
 * Strip a leading 2-letter locale prefix from pathname.
 * Mirrors the helper in lib/constants/shared/route-guard.ts which is
 * private to that file. Re-defined here to avoid coupling.
 */
function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (!match) return pathname;
  return match[2] || '/';
}

/**
 * Returns true if pathname matches /dashboard/setup-store (the only
 * destination BUYER + digital-off should be allowed to reach).
 */
function isSetupStorePath(pathname: string): boolean {
  return stripLocalePrefix(pathname) === '/dashboard/setup-store';
}

/**
 * Should the guard hide content while a redirect is in flight?
 * Pure function — used by both the effect and the render guard so
 * effect logic and render logic stay in sync.
 */
function shouldHide(
  tenant: { role: string } | null,
  pathname: string,
): boolean {
  if (!tenant) return false;

  // Case A — Digital OFF + BUYER → only setup-store is allowed
  if (!FEATURES.digitalProducts && tenant.role === 'BUYER') {
    return !isSetupStorePath(pathname);
  }

  // Case B — Digital ON + BUYER on seller-only route → hide while redirecting
  if (tenant.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
    return true;
  }

  // Case C — Digital OFF + SELLER on digital route → DO NOT hide
  // The page itself renders <ComingSoonPage />. We want users to see it.
  return false;
}

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);

  useEffect(() => {
    if (!tenant) return;

    // Case A
    if (!FEATURES.digitalProducts && tenant.role === 'BUYER') {
      if (!isSetupStorePath(pathname)) {
        router.replace('/dashboard/setup-store');
      }
      return;
    }

    // Case B (existing — digital ON, BUYER on seller route)
    if (tenant.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
      router.replace('/dashboard/library');
      return;
    }

    // Case C is intentionally a no-op — page-level ComingSoonPage handles it.
  }, [tenant, pathname, router]);

  if (shouldHide(tenant, pathname)) {
    return null;
  }

  return <>{children}</>;
}
