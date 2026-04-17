'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { isBuyerRestrictedRoute } from '@/lib/constants/shared/route-guard';

interface DashboardRouteGuardProps {
  children: React.ReactNode;
}

export function DashboardRouteGuard({ children }: DashboardRouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const tenant = useAuthStore((s) => s.tenant);

  useEffect(() => {
    if (!tenant) return;
    if (tenant.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
      router.replace('/dashboard/library');
    }
  }, [tenant, pathname, router]);

  if (tenant?.role === 'BUYER' && isBuyerRestrictedRoute(pathname)) {
    return null;
  }

  return <>{children}</>;
}