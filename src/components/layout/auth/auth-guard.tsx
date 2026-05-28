'use client';

// ============================================================================
// AUTH GUARD
// File: src/components/layout/auth/auth-guard.tsx
//
// [SPRINT 1 — R1 FIX: AuthGuard race on unmount]
// Tambah `mounted` variable di useAuthCheck untuk guard setState setelah
// komponen unmount. Tanpa ini, React 18 warn di dev mode dan potensi
// memory leak + state inconsistency jika user navigasi cepat.
//
// Fix pattern:
//   let mounted = true;
//   const run = async () => {
//     try { ... } finally {
//       if (mounted) setChecked(true);
//     }
//   };
//   return () => { mounted = false; };
// ============================================================================

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthHydrated, useIsAuthenticated, useAuthChecked, useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api/auth';

// ==========================================
// useAuthCheck — shared internal hook
// ==========================================

function useAuthCheck() {
  const isHydrated = useAuthHydrated();
  const isChecked = useAuthChecked();
  const { setTenant, setChecked } = useAuthStore();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (!isHydrated || hasCheckedRef.current || isChecked) return;

    hasCheckedRef.current = true;

    // [R1 FIX] Track mounted state untuk guard async setState
    let mounted = true;

    const run = async () => {
      try {
        const response = await authApi.status();
        // [R1 FIX] Cek mounted sebelum setState — komponen mungkin sudah unmount
        if (!mounted) return;
        setTenant(response.authenticated && response.tenant ? response.tenant : null);
      } catch {
        // [R1 FIX] Cek mounted sebelum setState
        if (!mounted) return;
        setTenant(null);
      } finally {
        // [R1 FIX] Cek mounted sebelum setState
        if (mounted) {
          setChecked(true);
        }
      }
    };

    run();

    // [R1 FIX] Cleanup: set mounted = false saat komponen unmount
    return () => {
      mounted = false;
    };
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
