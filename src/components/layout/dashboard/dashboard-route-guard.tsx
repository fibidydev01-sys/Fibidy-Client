'use client';

// ============================================================================
// DASHBOARD ROUTE GUARD
// File: src/components/layout/dashboard/dashboard-route-guard.tsx
//
// [PHASE D — May 2026]
// Case E — EDU seller tidak boleh akses KYC + Subscription:
//   - /dashboard/subscription → redirect /dashboard/products
//   - /onboard → redirect /dashboard/products
//   - KYC banner: early return null (handled in kyc-banner.tsx)
//   - Subscription menu: filtered in sidebar-nav + mobile-navbar
//
// [SETUP-GATE — May 2026]
// Case D — SELLER + isSetupComplete=false → redirect /dashboard/setup-store
//
// [PHASE 3]
// Case A — Digital OFF + BUYER → redirect /dashboard/setup-store
// Case B — Digital ON + BUYER on seller-only route → redirect /dashboard/library
// Case C — Digital OFF + SELLER on digital route → page shows ComingSoonPage
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

/**
 * [PHASE D] Returns true if pathname is an EDU-restricted path.
 * EDU sellers cannot access subscription or KYC onboarding pages.
 */
function isEduRestrictedPath(pathname: string): boolean {
  const clean = stripLocalePrefix(pathname);
  return (
    clean.startsWith('/dashboard/subscription') ||
    clean.startsWith('/onboard')
  );
}

function shouldHide(
  tenant: { role: string; isSetupComplete?: boolean; isEduMode?: boolean } | null,
  pathname: string,
): boolean {
  if (!tenant) return false;

  // Case E — EDU: hide while redirect in-flight
  if (
    tenant.role === 'SELLER' &&
    tenant.isEduMode === true &&
    isEduRestrictedPath(pathname)
  ) {
    return true;
  }

  // Case D — SELLER setup not complete → hide until redirect fires
  if (
    tenant.role === 'SELLER' &&
    !tenant.isSetupComplete &&
    !isSetupStorePath(pathname) &&
    !isStudioPath(pathname)
  ) {
    return true;
  }

  // Case A — Digital OFF + BUYER → only setup-store is allowed
  if (!FEATURES.digitalProducts && tenant.role === 'BUYER') {
    return !isSetupStorePath(pathname);
  }

  // Case B — Digital ON + BUYER on seller-only route → hide while redirecting
  if (tenant.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
    return true;
  }

  // Case C — Digital OFF + SELLER on digital route → DO NOT hide
  return false;
}

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);

  useEffect(() => {
    if (!tenant) return;

    // Case E — EDU seller: redirect from subscription + onboard
    if (
      tenant.role === 'SELLER' &&
      tenant.isEduMode === true &&
      isEduRestrictedPath(pathname)
    ) {
      router.replace('/dashboard/products');
      return;
    }

    // Case D — SELLER + isSetupComplete=false → must complete setup wizard
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

    // Case C — no-op
  }, [tenant, pathname, router]);

  if (shouldHide(tenant, pathname)) {
    return null;
  }

  return <>{children}</>;
}
