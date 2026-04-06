'use client';

// ==========================================
// ADMIN GUARD
// File: src/components/admin/admin-guard.tsx
//
// Pattern IDENTIK dengan src/components/auth/auth-guard.tsx
// - Cek session via GET /api/admin/auth/me
// - Loading state saat checking
// - Redirect ke /admin/login kalau tidak authenticated
// ==========================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useIsAdminAuthenticated,
  useAdminChecked,
  useAdminLoading,
} from '@/stores/admin-store';
import { useAdminAuthCheck } from '@/hooks/admin/use-admin';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const isAuthenticated = useIsAdminAuthenticated();
  const isChecked = useAdminChecked();
  const isLoading = useAdminLoading();

  // Check auth on mount
  useAdminAuthCheck();

  useEffect(() => {
    if (!isChecked) return;
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isChecked, isAuthenticated, router]);

  // Loading state
  if (!isChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

// ==========================================
// ADMIN GUEST GUARD
// Redirect ke /admin kalau sudah login
// Dipakai di halaman /admin/login
// ==========================================

export function AdminGuestGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const isAuthenticated = useIsAdminAuthenticated();
  const isChecked = useAdminChecked();

  useAdminAuthCheck();

  useEffect(() => {
    if (!isChecked) return;
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isChecked, isAuthenticated, router]);

  if (!isChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <>{children}</>;
}