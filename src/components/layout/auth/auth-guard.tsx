'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthHydrated, useIsAuthenticated, useAuthChecked, useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';

// ==========================================
// useAuthCheck — shared internal hook
// Called in AuthGuard and GuestGuard
// Check session with server once on mount
// ==========================================

function useAuthCheck() {
  const isHydrated = useAuthHydrated();
  const isChecked = useAuthChecked();
  const { setTenant, setChecked } = useAuthStore();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasCheckedRef.current || isChecked) return;

    hasCheckedRef.current = true;

    const run = async () => {
      try {
        const response = await authApi.status();
        setTenant(response.authenticated && response.tenant ? response.tenant : null);
      } catch {
        setTenant(null);
      } finally {
        setChecked(true);
      }
    };

    run();
  }, [isHydrated, isChecked, setTenant, setChecked]);
}

// ==========================================
// AUTH GUARD
// ==========================================

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/login',
}: AuthGuardProps) {
  const t = useTranslations('auth.guard');
  const router = useRouter();
  const pathname = usePathname();

  const isHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const isChecked = useAuthChecked();
  const hasRedirectedRef = useRef(false);

  useAuthCheck();

  useEffect(() => {
    if (!isHydrated || !isChecked) return;
    if (hasRedirectedRef.current) return;

    if (requireAuth && !isAuthenticated) {
      hasRedirectedRef.current = true;
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`${redirectTo}?from=${returnUrl}`);
    }
  }, [isHydrated, isChecked, isAuthenticated, requireAuth, redirectTo, pathname, router]);

  if (!isHydrated || !isChecked) {
    return <LoadingScreen message={t('checkingAuth')} subtitle={t('pleaseWait')} />;
  }

  if (requireAuth && !isAuthenticated) {
    return <LoadingScreen message={t('redirecting')} subtitle={t('pleaseWait')} />;
  }

  return <>{children}</>;
}

// ==========================================
// GUEST GUARD
// ==========================================

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestGuard({
  children,
  redirectTo = '/dashboard',
}: GuestGuardProps) {
  const t = useTranslations('auth.guard');
  const router = useRouter();

  const isHydrated = useAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const isChecked = useAuthChecked();
  const hasRedirectedRef = useRef(false);

  useAuthCheck();

  useEffect(() => {
    if (!isHydrated || !isChecked) return;
    if (hasRedirectedRef.current) return;

    if (isAuthenticated) {
      hasRedirectedRef.current = true;
      router.replace(redirectTo);
    }
  }, [isHydrated, isChecked, isAuthenticated, redirectTo, router]);

  if (!isHydrated || !isChecked) {
    return <>{children}</>;
  }

  if (isAuthenticated) {
    return <LoadingScreen message={t('alreadySignedIn')} subtitle={t('pleaseWait')} />;
  }

  return <>{children}</>;
}

// ==========================================
// LOADING SCREEN
// ==========================================

function LoadingScreen({ message, subtitle }: { message: string; subtitle: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-3 rounded-full bg-primary/10 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}